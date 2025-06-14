# Phase 8: LLM-Powered Q&A Assistant

## Overview

The Q&A Assistant feature allows users to ask natural language questions about contracts and receive accurate answers based on the contract content. This feature leverages LLMs to understand user queries and provide relevant responses with source references and confidence scores.

## Architecture

### Backend Components

1. **QaAssistantModule**: NestJS module that handles Q&A functionality
2. **QaAssistantService**: Service that processes questions and retrieves answers
3. **QaAssistantController**: API endpoints for the Q&A feature
4. **OpenAIService**: Extended to include contract question answering capabilities
5. **ContractQa**: TypeORM entity model for storing question-answer history

### Frontend Components

1. **QaAssistant.tsx**: React component for the Q&A interface
2. **Integration in ContractDetail.tsx**: Added as a tab in the contract detail view

## Implementation Details

### Database Schema (TypeORM Entity)

```typescript
@Entity('contract_qa')
export class ContractQa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @Column()
  question: string;

  @Column('text')
  answer: string;

  @ManyToOne(() => Contract, (contract) => contract.qaItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

1. **POST /qa-assistant/answer**
   - Request: `{ contractId: string, question: string }`
   - Response: `{ answer: string, sources: string[], confidence: number }`
   - Functionality: Processes a question about a specific contract and returns an answer

2. **GET /qa-assistant/history/:contractId**
   - Response: Array of previous questions and answers for the contract
   - Functionality: Retrieves Q&A history for a specific contract

### OpenAI Integration

The system uses OpenAI's GPT-4 model to:
1. Process the question in the context of the contract
2. Generate a comprehensive answer
3. Provide source references to relevant clauses or sections
4. Assign a confidence score to the answer

### User Interface

The Q&A Assistant UI includes:
1. Chat-like interface with message history
2. Input field for asking questions
3. Visual indicators for AI confidence levels
4. Automatic scrolling to new messages
5. Loading states during API calls

## Usage Flow

1. User navigates to a contract's detail page
2. User selects the "Q&A Assistant" tab
3. User types a question about the contract (e.g., "What is the termination clause?")
4. System processes the question using the contract's text and clauses as context
5. System displays the answer with references to relevant sections
6. Question and answer are saved to history for future reference

## Technical Implementation

### TypeORM Integration

The implementation uses TypeORM instead of Prisma for database operations:

1. **Entity Definition**: ContractQa entity defined with TypeORM decorators
2. **Repository Pattern**: Using TypeORM's Repository for CRUD operations
3. **Relation Management**: ManyToOne relationship with Contract entity
4. **Database Module**: TypeORM configured in a dedicated DatabaseModule

### Key Service Methods

1. **answerQuestion**: Retrieves contract data, builds context, and calls OpenAI
2. **saveQuestionAnswer**: Stores Q&A history in the database
3. **getPreviousQa**: Retrieves previous Q&A for a specific contract
4. **buildContext**: Creates context from contract clauses and text

## Testing

- Unit tests for QaAssistantService methods
- Integration tests for API endpoints
- UI component tests for QaAssistant.tsx

## Future Enhancements

1. Vector embeddings for more efficient semantic search
2. Fine-tuning models on legal documents
3. Multi-contract queries (asking questions across multiple contracts)
4. Improved source attribution with direct text highlighting
5. Follow-up question capabilities with conversation context 