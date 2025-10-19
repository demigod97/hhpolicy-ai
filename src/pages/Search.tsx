import React from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { SecondaryNavigationBar } from '@/components/navigation/SecondaryNavigationBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';

const Search = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardHeader userEmail={user?.email} />
      <PrimaryNavigationBar />
      <SecondaryNavigationBar />

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-normal text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600 mb-6">
            Advanced search functionality is coming soon.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Search across all policy documents, chat history, and notes with powerful filters and AI-powered semantic search.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Search;
