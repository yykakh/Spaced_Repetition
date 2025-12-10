import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    
    // Get total concepts
    const total = await db.concept.count()
    
    // Get concepts due today
    const dueToday = await db.concept.count({
      where: {
        nextReview: {
          lte: now
        }
      }
    })
    
    // Get learned concepts (repetitions >= 3)
    const learned = await db.concept.count({
      where: {
        repetitions: {
          gte: 3
        }
      }
    })

    const stats = {
      total,
      dueToday,
      learned
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}