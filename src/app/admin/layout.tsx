import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Users, BookOpen, Building2, FolderOpen, Settings, BarChart, Image, Camera, FileText, Shield, ImagePlus, Sparkles, PlusCircle, Video, Search, Layers } from 'lucide-react'
import Header from '@/components/layout/header'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-grey-50">
      <Header />
      <div className="flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-grey-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-grey-200">
          <h1 className="text-xl font-bold text-grey-900">Admin Panel</h1>
          <p className="text-sm text-grey-600 mt-1">Platform Management</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/storytellers">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="w-4 h-4 mr-3" />
              Users
            </Button>
          </Link>
          <Link href="/admin/stories">
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-3" />
              Stories
            </Button>
          </Link>
          <Link href="/admin/organisations">
            <Button variant="ghost" className="w-full justify-start">
              <Building2 className="w-4 h-4 mr-3" />
              Organizations
            </Button>
          </Link>
          <Link href="/admin/projects">
            <Button variant="ghost" className="w-full justify-start">
              <FolderOpen className="w-4 h-4 mr-3" />
              Projects
            </Button>
          </Link>

          {/* Quick Actions */}
          <div className="pt-4">
            <div className="text-xs font-semibold text-grey-500 uppercase tracking-wide mb-2 px-3">
              Quick Actions
            </div>
            <Link href="/admin/workflow">
              <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Sparkles className="w-4 h-4 mr-3" />
                Story Workflow
              </Button>
            </Link>
            <Link href="/admin/quick-add">
              <Button variant="ghost" className="w-full justify-start">
                <PlusCircle className="w-4 h-4 mr-3" />
                Quick Add
              </Button>
            </Link>
          </div>

          {/* Media Section */}
          <div className="pt-4">
            <div className="text-xs font-semibold text-grey-500 uppercase tracking-wide mb-2 px-3">
              Media
            </div>
            <Link href="/admin/galleries">
              <Button variant="ghost" className="w-full justify-start">
                <Image className="w-4 h-4 mr-3" />
                Galleries
              </Button>
            </Link>
            <Link href="/admin/photos">
              <Button variant="ghost" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-3" />
                Photos
              </Button>
            </Link>
            <Link href="/admin/story-images">
              <Button variant="ghost" className="w-full justify-start">
                <ImagePlus className="w-4 h-4 mr-3" />
                Story Images
              </Button>
            </Link>
            <Link href="/admin/transcripts">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-3" />
                Transcripts
              </Button>
            </Link>
            <Link href="/admin/videos">
              <Button variant="ghost" className="w-full justify-start">
                <Video className="w-4 h-4 mr-3" />
                Videos
              </Button>
            </Link>
            <Link href="/admin/smart-gallery">
              <Button variant="ghost" className="w-full justify-start">
                <Layers className="w-4 h-4 mr-3" />
                Smart Gallery
              </Button>
            </Link>
            <Link href="/admin/search">
              <Button variant="ghost" className="w-full justify-start">
                <Search className="w-4 h-4 mr-3" />
                Smart Search
              </Button>
            </Link>
          </div>

          {/* Management Section */}
          <div className="pt-4">
            <div className="text-xs font-semibold text-grey-500 uppercase tracking-wide mb-2 px-3">
              Management
            </div>
            <Link href="/admin/reviews">
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-3" />
                Reviews
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart className="w-4 h-4 mr-3" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-grey-200">
          <Link href="/">
            <Button variant="outline" className="w-full">
              View Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
      </div>
    </div>
  )
}