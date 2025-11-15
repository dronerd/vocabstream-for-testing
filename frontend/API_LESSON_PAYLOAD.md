# AI Lesson API Payload Structure

## Overview
The frontend now sends comprehensive timing and component information to the backend to enable effective lesson progression based on time allocations.

## Casual Conversation Mode Payload

```json
{
  "message": "user message",
  "level": "B1",
  "topics": ["Computer Science & Technology", "custom topic"],
  "mode": "casual"
}
```

## Lesson Mode Payload

```json
{
  "message": "user message",
  "level": "B1",
  "topics": ["Computer Science & Technology"],
  "tests": ["TOEFL", "IELTS"],
  "skills": ["Reading", "Speaking"],
  "duration": 15,
  "durationMinutes": 15,
  "currentComponent": 0,
  "currentComponentName": "Vocab Practice",
  "components": ["Vocab Practice", "Reading Comprehension", "Speaking Practice"],
  "componentTiming": [
    {
      "component": "Vocab Practice",
      "startSeconds": 0,
      "endSeconds": 300,
      "durationSeconds": 300
    },
    {
      "component": "Reading Comprehension",
      "startSeconds": 300,
      "endSeconds": 600,
      "durationSeconds": 300
    },
    {
      "component": "Speaking Practice",
      "startSeconds": 600,
      "endSeconds": 900,
      "durationSeconds": 300
    }
  ],
  "totalTimeElapsed": 45,
  "timeElapsedSeconds": 45,
  "vocabCategory": "word-intermediate",
  "vocabLessons": ["1", "2", "3", "4", "5"],
  "mode": "lesson"
}
```

## Key Fields Explained

### Timing Information
- **duration**: Total lesson duration in minutes (5, 10, 15, 20, 25, or 30)
- **durationMinutes**: Same as duration, for clarity
- **currentComponent**: Zero-based index of the current lesson component
- **currentComponentName**: Name of the component currently being taught
- **totalTimeElapsed**: Total seconds elapsed since lesson start
- **timeElapsedSeconds**: Same as totalTimeElapsed, for clarity

### Component Timing Array
Each object in `componentTiming` contains:
- **component**: Name of the lesson component (e.g., "Vocab Practice")
- **startSeconds**: When this component starts (0-based)
- **endSeconds**: When this component ends
- **durationSeconds**: Duration of this component in seconds

**Example for a 15-minute lesson with 3 components:**
- Vocab Practice: 0-300 seconds (5 minutes)
- Reading Comprehension: 300-600 seconds (5 minutes)
- Speaking Practice: 600-900 seconds (5 minutes)

### Lesson Configuration
- **skills**: Array of skills to focus on ["Reading", "Listening", "Writing", "Speaking"]
- **tests**: Array of exam types ["TOEFL", "IELTS", "TOEIC", "Eiken", "Cambridge"]
- **vocabCategory**: Category of vocabulary (if "Vocab Practice" is included)
- **vocabLessons**: Array of lesson numbers to cover

## Backend Implementation Guide

### Recommended Backend Logic

```python
def process_lesson_message(payload):
    current_component = payload['currentComponentName']
    time_elapsed = payload['timeElapsedSeconds']
    component_timing = payload['componentTiming']
    
    # Find current component info
    current_timing = next(
        (ct for ct in component_timing if ct['component'] == current_component),
        None
    )
    
    # Calculate remaining time in current component
    time_in_component = time_elapsed - current_timing['startSeconds']
    remaining_time = current_timing['durationSeconds'] - time_in_component
    
    # Adjust lesson difficulty and pace based on:
    # 1. Current component type
    # 2. Time remaining in this component
    # 3. Student's level
    # 4. Skills being practiced
    
    # Generate contextual response that:
    # - Matches the current component focus
    # - Respects the time constraints
    # - Provides appropriate difficulty for the student level
    # - Incorporates the selected topics
    
    return {
        "reply": "Generated lesson content based on timing and component"
    }
```

### Time-Aware Response Generation

1. **For Vocab Practice Component:**
   - Focus on vocabulary building
   - Use selected vocab lessons/categories
   - Limit response length based on remaining time

2. **For Reading Comprehension Component:**
   - Provide reading materials of appropriate length
   - Include comprehension questions
   - Adjust complexity by level

3. **For Speaking Practice Component:**
   - Generate prompts for conversation
   - Ask follow-up questions
   - Encourage longer responses

4. **For Other Components:**
   - Adapt response type based on component name
   - Consider time remaining for appropriate pacing

## Integration Example

When a user sends a message during a lesson:

1. Frontend captures `timeElapsed`
2. Frontend sends payload with current timing information
3. Backend receives payload and:
   - Checks which component is currently active
   - Calculates time remaining in that component
   - Generates appropriate lesson content
   - Returns AI response focused on current component
4. Frontend displays response and updates timer
5. When time for component expires, frontend auto-prompts "次は『次のコンポーネント』に移ってください"

## Notes

- All times are in seconds for precision
- Component timing is calculated when lesson starts based on selected duration and components
- If 3 components over 15 minutes: each gets 5 minutes (300 seconds)
- Frontend auto-advances component when time expires
- Backend can use timing info to adjust response generation strategy
