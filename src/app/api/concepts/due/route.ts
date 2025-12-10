import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    
    const dueConcepts = await db.concept.findMany({
      where: {
        nextReview: {
          lte: now
        }
      },
      orderBy: [
        { nextReview: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(dueConcepts)
  } catch (error) {
    console.error('Error fetching due concepts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch due concepts' },
      { status: 500 }
    )
  }
}