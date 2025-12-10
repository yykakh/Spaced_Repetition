import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateNextReview, responseToQuality } from '@/lib/spaced-repetition'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { remembered } = body

    if (typeof remembered !== 'boolean') {
      return NextResponse.json(
        { error: 'Remembered field must be a boolean' },
        { status: 400 }
      )
    }

    // Get the current concept
    const concept = await db.concept.findUnique({
      where: { id: params.id }
    })

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      )
    }

    // Calculate the next review using SM-2 algorithm
    const quality = responseToQuality(remembered)
    const result = calculateNextReview(
      concept.easiness,
      concept.interval,
      concept.repetitions,
      quality
    )

    // Update the concept with new values
    const updatedConcept = await db.concept.update({
      where: { id: params.id },
      data: {
        easiness: result.easiness,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReview: result.nextReview,
        lastReview: new Date()
      }
    })

    return NextResponse.json(updatedConcept)
  } catch (error) {
    console.error('Error updating concept review:', error)
    return NextResponse.json(
      { error: 'Failed to update concept review' },
      { status: 500 }
    )
  }
}