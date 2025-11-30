# System Diagrams - DiaryPro

This document contains sequence diagrams and UML diagrams for the DiaryPro application.

---

## Sequence Diagrams

### 1. User Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant RegisterPage
    participant SupabaseAuth
    participant Database

    User->>Browser: Enter registration details
    Browser->>RegisterPage: Submit form
    RegisterPage->>RegisterPage: Validate input (email, password)
    
    alt Validation fails
        RegisterPage->>User: Show error message
    else Validation passes
        RegisterPage->>SupabaseAuth: signUp(email, password, metadata)
        SupabaseAuth->>SupabaseAuth: Hash password (bcrypt)
        SupabaseAuth->>Database: Create user record
        Database-->>SupabaseAuth: User created
        SupabaseAuth->>SupabaseAuth: Send verification email
        SupabaseAuth-->>RegisterPage: Success response
        RegisterPage->>User: Show success message
        RegisterPage->>Browser: Redirect to login
    end
```

### 2. User Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant LoginPage
    participant SupabaseAuth
    participant Database
    participant CookieStore

    User->>Browser: Enter credentials
    Browser->>LoginPage: Submit form
    LoginPage->>LoginPage: Validate input
    
    alt Validation fails
        LoginPage->>User: Show error message
    else Validation passes
        LoginPage->>SupabaseAuth: signInWithPassword(email, password)
        SupabaseAuth->>Database: Verify credentials
        Database-->>SupabaseAuth: User record + hashed password
        SupabaseAuth->>SupabaseAuth: Compare password hash
        
        alt Invalid credentials
            SupabaseAuth-->>LoginPage: Error response
            LoginPage->>User: Show error message
        else Valid credentials
            SupabaseAuth->>SupabaseAuth: Generate JWT token
            SupabaseAuth->>CookieStore: Store token (HTTP-only cookie)
            SupabaseAuth-->>LoginPage: Success + user data
            LoginPage->>Browser: Redirect to dashboard
        end
    end
```

### 3. Entry Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant EntryPage
    participant Validation
    participant Compression
    participant EntriesAPI
    participant SupabaseAuth
    participant Database
    participant RLS

    User->>Browser: Fill entry form + upload media
    Browser->>EntryPage: Submit form
    EntryPage->>EntryPage: Validate content & mood
    
    alt Validation fails
        EntryPage->>User: Show error message
    else Validation passes
        EntryPage->>SupabaseAuth: getUser()
        SupabaseAuth-->>EntryPage: User data + JWT token
        
        alt Not authenticated
            EntryPage->>Browser: Redirect to login
        else Authenticated
            EntryPage->>Validation: Validate media files
            Validation->>Validation: Check file size, type, name
            
            alt Invalid files
                Validation-->>EntryPage: Error
                EntryPage->>User: Show error message
            else Valid files
                EntryPage->>Compression: Compress media files
                Compression-->>EntryPage: Compressed blobs
                EntryPage->>EntryPage: Convert to base64
                EntryPage->>EntriesAPI: createEntry(data)
                
                EntriesAPI->>SupabaseAuth: Verify user
                SupabaseAuth-->>EntriesAPI: User authenticated
                EntriesAPI->>Database: INSERT entry (user_id, mood_id, text, date, time)
                Database->>RLS: Check RLS policy
                RLS->>RLS: Verify auth.uid() = user_id
                RLS-->>Database: Policy allows
                Database-->>EntriesAPI: Entry created (entry_id)
                
                alt Has media files
                    EntriesAPI->>EntriesAPI: Process media files
                    EntriesAPI->>EntriesAPI: Sanitize file names
                    EntriesAPI->>Database: INSERT media_files (entry_id, file_name, base64_data, file_size)
                    Database->>RLS: Check RLS policy
                    RLS->>RLS: Verify entry belongs to user
                    RLS-->>Database: Policy allows
                    Database-->>EntriesAPI: Media files inserted
                end
                
                EntriesAPI-->>EntryPage: Entry created successfully
                EntryPage->>Browser: Redirect to dashboard
                EntryPage->>User: Show success message
            end
        end
    end
```

### 4. Entry Access Flow (Security-Enhanced)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant EntryPage
    participant EntriesAPI
    participant SupabaseAuth
    participant Database
    participant RLS

    User->>Browser: Navigate to /entry/[id]
    Browser->>EntryPage: Load entry page
    EntryPage->>SupabaseAuth: getUser()
    SupabaseAuth-->>EntryPage: User data + JWT token
    
    alt Not authenticated
        EntryPage->>Browser: Redirect to login
    else Authenticated
        EntryPage->>EntriesAPI: getEntryById(entryId)
        EntriesAPI->>SupabaseAuth: getUser()
        SupabaseAuth-->>EntriesAPI: User authenticated (user.id)
        
        Note over EntriesAPI: SECURITY: Client-side ownership check
        EntriesAPI->>Database: SELECT * FROM entries<br/>WHERE entry_id = ?<br/>AND user_id = ?<br/>AND is_deleted = false
        
        Database->>RLS: Check RLS policy
        RLS->>RLS: Verify auth.uid() = user_id
        RLS->>RLS: Verify entry_id matches
        
        alt RLS policy fails
            RLS-->>Database: Access denied
            Database-->>EntriesAPI: No data returned
            EntriesAPI-->>EntryPage: Entry not found
            EntryPage->>Browser: Redirect to dashboard
        else RLS policy allows
            RLS-->>Database: Access granted
            Database->>Database: SELECT media_files WHERE entry_id = ?
            Database->>RLS: Check media RLS policy
            RLS->>RLS: Verify entry belongs to user
            RLS-->>Database: Access granted
            Database-->>EntriesAPI: Entry + media files
            EntriesAPI-->>EntryPage: Entry data
            EntryPage->>Browser: Render entry
            Browser->>User: Display entry
        end
    end
```

### 5. Entry Update Flow (Security-Enhanced)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant EditPage
    participant EntriesAPI
    participant SupabaseAuth
    participant Database
    participant RLS

    User->>Browser: Edit entry and submit
    Browser->>EditPage: Submit form
    EditPage->>EditPage: Validate input
    
    alt Validation fails
        EditPage->>User: Show error message
    else Validation passes
        EditPage->>SupabaseAuth: getUser()
        SupabaseAuth-->>EditPage: User authenticated
        EditPage->>EntriesAPI: updateEntry(entryId, data)
        
        EntriesAPI->>SupabaseAuth: getUser()
        SupabaseAuth-->>EntriesAPI: User authenticated (user.id)
        
        Note over EntriesAPI: SECURITY: Ownership verification
        EntriesAPI->>Database: SELECT user_id FROM entries<br/>WHERE entry_id = ?<br/>AND user_id = ?
        Database->>RLS: Check RLS policy
        RLS-->>Database: Access granted (user owns entry)
        Database-->>EntriesAPI: Entry ownership confirmed
        
        alt Entry not found or not owned
            EntriesAPI-->>EditPage: Unauthorized error
            EditPage->>User: Show error message
        else Entry owned by user
            EntriesAPI->>Database: DELETE media_files WHERE entry_id = ?
            Database->>RLS: Check RLS policy
            RLS-->>Database: Access granted
            Database-->>EntriesAPI: Old media deleted
            
            alt Has new media files
                EntriesAPI->>EntriesAPI: Process & sanitize media
                EntriesAPI->>Database: INSERT media_files
                Database->>RLS: Check RLS policy
                RLS-->>Database: Access granted
                Database-->>EntriesAPI: Media inserted
            end
            
            EntriesAPI->>Database: UPDATE entries SET ...<br/>WHERE entry_id = ?<br/>AND user_id = ?
            Database->>RLS: Check RLS policy
            RLS-->>Database: Access granted
            Database-->>EntriesAPI: Entry updated
            EntriesAPI-->>EditPage: Update successful
            EditPage->>Browser: Redirect to entry view
            EditPage->>User: Show success message
        end
    end
```

---

## UML Class Diagram

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String name
        +DateTime createdAt
        +authenticate()
        +getSession()
    }
    
    class Entry {
        +Integer entry_id
        +UUID user_id
        +Integer mood_id
        +String entry_text
        +Date entry_date
        +Time entry_time
        +DateTime created_at
        +DateTime updated_at
        +Boolean is_deleted
        +create()
        +update()
        +delete()
        +getById()
    }
    
    class MediaFile {
        +Integer media_id
        +Integer entry_id
        +String file_name
        +String file_type
        +String media_category
        +String base64_data
        +Integer file_size
        +DateTime uploaded_at
        +validate()
        +sanitizeFileName()
    }
    
    class Mood {
        +Integer mood_id
        +String mood_name
        +String mood_emoji
        +String mood_color
        +String mood_description
    }
    
    class EntryService {
        +createEntry(data)
        +updateEntry(id, data)
        +deleteEntry(id)
        +getEntryById(id)
        +getEntries(limit, offset)
        +verifyOwnership(entryId, userId)
    }
    
    class SecurityValidator {
        +validatePassword(password)
        +sanitizeFileName(fileName)
        +validateFileType(file, type)
        +validateEntryText(text)
        +validateEmail(email)
    }
    
    class ErrorHandler {
        +handleError(error, context)
        +sanitizeErrorMessage(error)
        +logSecurityEvent(event)
    }
    
    class SupabaseClient {
        +createClient()
        +auth.getUser()
        +auth.signUp()
        +auth.signIn()
        +from(table)
    }
    
    class Database {
        +RLS Policies
        +executeQuery(query)
        +enforceRLS()
    }
    
    User "1" --> "*" Entry : owns
    Entry "1" --> "*" MediaFile : contains
    Entry "1" --> "1" Mood : has
    EntryService --> User : requires
    EntryService --> Entry : manages
    EntryService --> MediaFile : manages
    EntryService --> SecurityValidator : uses
    EntryService --> SupabaseClient : uses
    SecurityValidator --> MediaFile : validates
    ErrorHandler --> EntryService : handles errors
    SupabaseClient --> Database : connects to
    Database --> Entry : stores
    Database --> MediaFile : stores
    Database --> User : stores
```

---

## Component Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Browser] --> B[Next.js App]
        B --> C[React Components]
        C --> D[Auth Pages]
        C --> E[Entry Pages]
        C --> F[Dashboard]
    end
    
    subgraph "Security Layer"
        G[Security Validator]
        H[Error Handler]
        I[File Sanitizer]
        J[Input Validator]
    end
    
    subgraph "Service Layer"
        K[Entry Service]
        L[Auth Service]
        M[Media Service]
    end
    
    subgraph "Data Layer"
        N[Supabase Client]
        O[Supabase Auth]
        P[Supabase Database]
    end
    
    subgraph "Database Layer"
        Q[(PostgreSQL)]
        R[RLS Policies]
        S[User Data]
        T[Entry Data]
        U[Media Data]
    end
    
    D --> L
    E --> K
    F --> K
    
    K --> G
    K --> H
    M --> I
    M --> J
    
    K --> N
    L --> O
    M --> N
    
    N --> P
    O --> P
    P --> Q
    
    Q --> R
    R --> S
    R --> T
    R --> U
    
    style G fill:#ff6b6b
    style H fill:#ff6b6b
    style I fill:#ff6b6b
    style J fill:#ff6b6b
    style R fill:#51cf66
```

---

## Security Flow Diagram

```mermaid
flowchart TD
    A[User Request] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Extract JWT Token]
    D --> E[Verify Token]
    E -->|Invalid| C
    E -->|Valid| F{Authorized?}
    
    F -->|Check Ownership| G[Verify User ID]
    G -->|Not Owner| H[Access Denied]
    G -->|Owner| I[Check RLS Policy]
    
    I -->|RLS Allows| J[Execute Query]
    I -->|RLS Denies| H
    
    J --> K[Validate Input]
    K -->|Invalid| L[Return Error]
    K -->|Valid| M[Sanitize Data]
    
    M --> N[Process Request]
    N --> O[Log Security Event]
    O --> P[Return Response]
    
    style B fill:#ffd43b
    style F fill:#ffd43b
    style I fill:#51cf66
    style K fill:#ff6b6b
    style M fill:#ff6b6b
    style O fill:#339af0
```

---

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph "User Input"
        A[Entry Text]
        B[Media Files]
        C[Mood Selection]
    end
    
    subgraph "Validation"
        D[Text Validation]
        E[File Validation]
        F[File Sanitization]
    end
    
    subgraph "Processing"
        G[Compression]
        H[Base64 Encoding]
        I[Size Calculation]
    end
    
    subgraph "Storage"
        J[(Database)]
        K[RLS Enforcement]
    end
    
    A --> D
    B --> E
    E --> F
    F --> G
    G --> H
    H --> I
    C --> D
    D --> J
    I --> J
    J --> K
    
    style D fill:#ff6b6b
    style E fill:#ff6b6b
    style F fill:#ff6b6b
    style K fill:#51cf66
```

---

## Authentication & Authorization Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Login: User navigates to login
    Login --> Authenticating: Submit credentials
    Authenticating --> Authenticated: Valid credentials
    Authenticating --> Login: Invalid credentials
    
    Authenticated --> Authorizing: Request resource
    Authorizing --> Authorized: User owns resource
    Authorizing --> Unauthorized: User doesn't own resource
    
    Authorized --> Authenticated: Request complete
    Unauthorized --> Authenticated: Show error
    
    Authenticated --> Unauthenticated: Logout or token expired
    
    note right of Authenticated
        JWT token stored in
        HTTP-only cookie
    end note
    
    note right of Authorizing
        Checks:
        1. Client-side ownership
        2. Database RLS policy
    end note
```

---

## File Upload Security Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant FileInput
    participant Validator
    participant Compressor
    participant Encoder
    participant Database
    participant RLS

    User->>Browser: Select file
    Browser->>FileInput: File selected
    FileInput->>Validator: Validate file
    
    Validator->>Validator: Check file size (10MB max)
    Validator->>Validator: Check MIME type
    
    alt Invalid file
        Validator-->>FileInput: Reject file
        FileInput->>User: Show error
    else Valid file
        Validator->>Validator: Sanitize file name
        Note over Validator: Remove path components<br/>Remove special chars<br/>Limit length (255)
        
        Validator->>Compressor: Compress file
        Compressor->>Compressor: Compress image (if applicable)
        Compressor-->>Validator: Compressed blob
        
        Validator->>Encoder: Convert to base64
        Encoder-->>Validator: Base64 string
        
        User->>Browser: Submit entry
        Browser->>Database: INSERT media_file
        
        Database->>RLS: Check RLS policy
        RLS->>RLS: Verify entry belongs to user
        RLS-->>Database: Access granted
        
        Database-->>Browser: File saved
        Browser->>User: Success message
    end
    
    Note over Validator,RLS: ⚠️ Missing: Magic byte validation<br/>⚠️ Missing: Server-side validation<br/>⚠️ Missing: Virus scanning
```

---

## Security Layers Diagram

```mermaid
graph TD
    A[User Request] --> B[Layer 1: Client Validation]
    B -->|Pass| C[Layer 2: Authentication]
    B -->|Fail| Z[Reject Request]
    
    C -->|Authenticated| D[Layer 3: Authorization Check]
    C -->|Not Authenticated| Y[Redirect to Login]
    
    D -->|Authorized| E[Layer 4: Input Sanitization]
    D -->|Not Authorized| X[Access Denied]
    
    E -->|Sanitized| F[Layer 5: Business Logic]
    E -->|Invalid| W[Validation Error]
    
    F -->|Processed| G[Layer 6: Database RLS]
    G -->|RLS Allows| H[Data Stored]
    G -->|RLS Denies| V[Database Rejects]
    
    H --> I[Layer 7: Response]
    I --> J[Security Headers Added]
    J --> K[Response Sent]
    
    style B fill:#ff6b6b
    style C fill:#ffd43b
    style D fill:#ffd43b
    style E fill:#ff6b6b
    style G fill:#51cf66
    style J fill:#339af0
```

---

## Database Security Architecture

```mermaid
erDiagram
    USERS ||--o{ ENTRIES : owns
    ENTRIES ||--o{ MEDIA_FILES : contains
    ENTRIES }o--|| MOODS : has
    
    USERS {
        uuid id PK
        string email
        string encrypted_password
        jsonb user_metadata
        timestamp created_at
    }
    
    ENTRIES {
        integer entry_id PK
        uuid user_id FK
        integer mood_id FK
        text entry_text
        date entry_date
        time entry_time
        timestamp created_at
        boolean is_deleted
    }
    
    MEDIA_FILES {
        integer media_id PK
        integer entry_id FK
        string file_name
        string file_type
        string media_category
        text base64_data
        integer file_size
        timestamp uploaded_at
    }
    
    MOODS {
        integer mood_id PK
        string mood_name
        string mood_emoji
        string mood_color
    }
    
    RLS_POLICIES {
        string policy_name
        string table_name
        string operation
        string condition
    }
    
    RLS_POLICIES ||--|| ENTRIES : enforces
    RLS_POLICIES ||--|| MEDIA_FILES : enforces
```

---

## Notes on Diagrams

### Sequence Diagrams
- Show the flow of operations with security checks
- Highlight authentication and authorization steps
- Demonstrate RLS policy enforcement
- Show error handling paths

### UML Class Diagram
- Shows relationships between entities
- Highlights security components
- Demonstrates service layer architecture
- Shows data flow through security layers

### Security Flow Diagram
- Illustrates defense-in-depth approach
- Shows multiple security checkpoints
- Demonstrates fail-safe mechanisms
- Highlights security logging points

---

**Last Updated:** 2024

