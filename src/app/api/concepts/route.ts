import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const concepts = await db.concept.findMany({
      orderBy: [
        { nextReview: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(concepts)
  } catch (error) {
    console.error('Error fetching concepts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch concepts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const concept = await db.concept.create({
      data: {
        title,
        category: category || null,
        easiness: 2.5,
        interval: 1,
        repetitions: 0,
        nextReview: new Date()
      }
    })

    return NextResponse.json(concept, { status: 201 })
  } catch (error) {
    console.error('Error creating concept:', error)
    return NextResponse.json(
      { error: 'Failed to create concept' },
      { status: 500 }
    )
  }
}