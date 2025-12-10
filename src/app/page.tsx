'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Plus, Brain, Calendar, TrendingUp, Clock, CheckCircle, ArrowRight, RefreshCw, Quote, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Concept {
  id: string
  title: string
  category?: string
  easiness: number
  interval: number
  repetitions: number
  nextReview: Date
  lastReview?: Date
  createdAt: Date
}

interface Quote {
  q: string
  a: string
}

export default function Home() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null)
  const [newConcept, setNewConcept] = useState({
    title: '',
    category: ''
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    dueToday: 0,
    learned: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [reviewProgress, setReviewProgress] = useState({ current: 0, total: 0 })
  const [quote, setQuote] = useState<Quote | null>(null)
  const [showAllConcepts, setShowAllConcepts] = useState(false)
  const [conceptToDelete, setConceptToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Load data from API
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [conceptsRes, statsRes, dueRes, quoteRes] = await Promise.all([
        fetch('/api/concepts'),
        fetch('/api/stats'),
        fetch('/api/concepts/due'),
        fetch('/api/quote')
      ])

      if (conceptsRes.ok && statsRes.ok && dueRes.ok && quoteRes.ok) {
        const [conceptsData, statsData, dueData, quoteData] = await Promise.all([
          conceptsRes.json(),
          statsRes.json(),
          dueRes.json(),
          quoteRes.json()
        ])

        setConcepts(conceptsData)
        setStats(statsData)
        setQuote(quoteData)
        setReviewProgress({ current: 1, total: dueData.length })
        
        // Set current concept to the first due concept
        if (dueData.length > 0) {
          setCurrentConcept(dueData[0])
        } else {
          setCurrentConcept(null)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error loading data",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch new quote
  const fetchNewQuote = async () => {
    try {
      const response = await fetch('/api/quote')
      if (response.ok) {
        const quoteData = await response.json()
        setQuote(quoteData)
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentConcept || isLoading) return
      
      switch(e.key.toLowerCase()) {
        case 'n':
          handleNotRemember()
          break
        case 'r':
          handleRemember()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentConcept, isLoading])

  useEffect(() => {
    loadData()
  }, [])

  const handleNotRemember = async () => {
    if (!currentConcept) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/concepts/${currentConcept.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ remembered: false })
      })

      if (response.ok) {
        toast({
          title: "No worries!",
          description: "We'll remind you about this concept again soon."
        })
        
        // Update progress before reloading
        setReviewProgress(prev => ({ ...prev, current: prev.current + 1 }))
        
        // Reload data to get the next concept
        await loadData()
      } else {
        throw new Error('Failed to update concept')
      }
    } catch (error) {
      console.error('Error updating concept:', error)
      toast({
        title: "Error",
        description: "Failed to update concept. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemember = async () => {
    if (!currentConcept) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/concepts/${currentConcept.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ remembered: true })
      })

      if (response.ok) {
        toast({
          title: "Great! You remembered it!",
          description: "The concept will appear again after a longer interval."
        })
        
        // Update progress before reloading
        setReviewProgress(prev => ({ ...prev, current: prev.current + 1 }))
        
        // Reload data to get the next concept
        await loadData()
      } else {
        throw new Error('Failed to update concept')
      }
    } catch (error) {
      console.error('Error updating concept:', error)
      toast({
        title: "Error",
        description: "Failed to update concept. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddConcept = async () => {
    if (!newConcept.title) {
      toast({
        title: "Missing information",
        description: "Please enter a title for your concept.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newConcept.title,
          category: newConcept.category || null
        })
      })

      if (response.ok) {
        setNewConcept({ title: '', category: '' })
        setIsAddDialogOpen(false)
        
        toast({
          title: "Concept added!",
          description: "Your new concept is ready for review."
        })
        
        // Reload data to refresh stats
        await loadData()
      } else {
        throw new Error('Failed to create concept')
      }
    } catch (error) {
      console.error('Error creating concept:', error)
      toast({
        title: "Error",
        description: "Failed to create concept. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteConcept = async (conceptId: string) => {
    try {
      const response = await fetch(`/api/concepts/${conceptId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Concept deleted!",
          description: "The concept has been removed from your library."
        })
        
        // Close dialog and reload data
        setIsDeleteDialogOpen(false)
        setConceptToDelete(null)
        await loadData()
      } else {
        throw new Error('Failed to delete concept')
      }
    } catch (error) {
      console.error('Error deleting concept:', error)
      toast({
        title: "Error",
        description: "Failed to delete concept. Please try again.",
        variant: "destructive"
      })
    }
  }

  const openDeleteDialog = (conceptId: string) => {
    setConceptToDelete(conceptId)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SpaceLearn</h1>
              <p className="text-gray-600 dark:text-gray-400">Master concepts with Spaced Repetition</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Concept
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Concept</DialogTitle>
                <DialogDescription>
                  Add a concept you want to remember and review.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Concept Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., React Hooks, Machine Learning Basics, etc."
                    value={newConcept.title}
                    onChange={(e) => setNewConcept({...newConcept, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Programming, Science, History"
                    value={newConcept.category}
                    onChange={(e) => setNewConcept({...newConcept, category: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddConcept}>
                  Add Concept
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Delete Concept
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this concept? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => conceptToDelete && handleDeleteConcept(conceptToDelete)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">In your learning library</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
              <p className="text-xs text-muted-foreground">Ready for review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.learned}</div>
              <p className="text-xs text-muted-foreground">Mastered concepts</p>
            </CardContent>
          </Card>
        </div>

        {/* Motivation Quote */}
        {quote && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Daily Motivation</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchNewQuote}
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  New Quote
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <Quote className="h-8 w-8 mx-auto text-purple-600 mb-4" />
              <blockquote className="text-lg italic text-gray-900 dark:text-white mb-2">
                "{quote.q}"
              </blockquote>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                — {quote.a}
              </p>
            </CardContent>
          </Card>
        )}

        {/* All Concepts Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Concepts</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAllConcepts(!showAllConcepts)}
                className="gap-1"
              >
                {showAllConcepts ? 'Hide' : 'Show'} All Concepts
              </Button>
            </div>
          </CardHeader>
          {showAllConcepts && (
            <CardContent>
              {concepts.length > 0 ? (
                <div className="space-y-3">
                  {concepts.map((concept) => {
                    const nextReviewDate = new Date(concept.nextReview)
                    const isDue = nextReviewDate <= new Date()
                    const daysUntilReview = Math.ceil((nextReviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={concept.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{concept.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {concept.category && (
                              <Badge variant="secondary" className="text-xs">{concept.category}</Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              Reviewed {concept.repetitions} times
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge 
                              variant={isDue ? "destructive" : daysUntilReview <= 3 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isDue ? 'Due Now' : daysUntilReview === 0 ? 'Today' : `In ${daysUntilReview} days`}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {nextReviewDate.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(concept.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No concepts added yet. Add your first concept to get started!</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Main Review Area */}
        {isLoading ? (
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
              <h3 className="text-xl font-medium mb-2">Loading...</h3>
              <p className="text-gray-600">Getting your concepts ready</p>
            </CardContent>
          </Card>
        ) : currentConcept ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Time to Review</CardTitle>
                <div className="flex gap-2">
                  {currentConcept.category && (
                    <Badge variant="secondary">{currentConcept.category}</Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Due now
                  </Badge>
                </div>
              </div>
              {reviewProgress.total > 1 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{reviewProgress.current} / {reviewProgress.total}</span>
                  </div>
                  <Progress value={(reviewProgress.current / reviewProgress.total) * 100} className="h-2" />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentConcept.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Take a moment to think about this concept and how well you remember it.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={handleNotRemember}
                    variant="outline"
                    size="lg"
                    className="min-w-[150px]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Not Remember'}
                  </Button>
                  <Button 
                    onClick={handleRemember}
                    variant="default"
                    size="lg"
                    className="min-w-[150px]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Remember'}
                  </Button>
                </div>
                <div className="flex justify-center gap-4 text-sm text-gray-500">
                  <span>Press N for Not Remember</span>
                  <span>Press R for Remember</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">All caught up!</h3>
              <p className="text-gray-600 mb-4">You've reviewed all due concepts. Great job!</p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Concept
                </Button>
                <Button variant="outline" onClick={loadData}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Check Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}