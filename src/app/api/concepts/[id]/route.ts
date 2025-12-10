import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params as required by Next.js 15
    const { id } = await params

    // Check if concept exists
    const concept = await db.concept.findUnique({
      where: { id }
    })

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      )
    }

    // Delete the concept
    await db.concept.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Concept deleted successfully' })
  } catch (error) {
    console.error('Error deleting concept:', error)
    return NextResponse.json(
      { error: 'Failed to delete concept' },
      { status: 500 }
    )
  }
}