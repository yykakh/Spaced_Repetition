// SM-2 Spaced Repetition Algorithm implementation
// Based on the SuperMemo SM-2 algorithm

export interface SpacedRepetitionResult {
  easiness: number
  interval: number
  repetitions: number
  nextReview: Date
}

export function calculateNextReview(
  currentEasiness: number,
  currentInterval: number,
  currentRepetitions: number,
  quality: number // Quality of response (0-5): 0=total blackout, 5=perfect response
): SpacedRepetitionResult {
  let easiness = currentEasiness
  let interval = currentInterval
  let repetitions = currentRepetitions

  // Update easiness factor
  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  // Ensure easiness doesn't go below 1.3
  if (easiness < 1.3) {
    easiness = 1.3
  }

  // Update repetitions and interval based on quality
  if (quality < 3) {
    // If quality is below 3, start over
    repetitions = 0
    interval = 1
  } else {
    // If quality is 3 or above, increase repetitions
    repetitions += 1
    
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easiness)
    }
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    easiness,
    interval,
    repetitions,
    nextReview
  }
}

// Convert user response (Remember/Not Remember) to quality score
export function responseToQuality(remembered: boolean): number {
  if (remembered) {
    // User remembered - good response (quality 4-5)
    // We'll use 4 for "Remember" to allow room for improvement
    return 4
  } else {
    // User didn't remember - poor response (quality 0-2)
    // We'll use 2 for "Not Remember" - not total blackout but needs review
    return 2
  }
}

// Check if a concept is due for review
export function isDueForReview(nextReview: Date): boolean {
  const now = new Date()
  return nextReview <= now
}

// Get concepts that are due for review
export function getDueConcepts(concepts: any[]): any[] {
  return concepts.filter(concept => isDueForReview(new Date(concept.nextReview)))
}

// Get statistics about concepts
export function getConceptStats(concepts: any[]) {
  const total = concepts.length
  const due = getDueConcepts(concepts).length
  const learned = concepts.filter(c => c.repetitions >= 3).length
  
  return {
    total,
    due,
    learned
  }
}