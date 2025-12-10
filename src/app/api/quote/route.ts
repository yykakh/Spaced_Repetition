import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/random')
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote')
    }
    
    const data = await response.json()
    
    return NextResponse.json(data[0]) // Return the first quote object
  } catch (error) {
    console.error('Error fetching quote:', error)
    
    // Fallback quote in case API fails
    const fallbackQuote = {
      q: "The expert in anything was once a beginner.",
      a: "Helen Hayes"
    }
    
    return NextResponse.json(fallbackQuote)
  }
}