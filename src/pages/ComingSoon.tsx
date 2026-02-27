import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Clock } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

interface ComingSoonProps {
  title?: string;
  description?: string;
  backUrl?: string;
}

// Simple Lottie animation data for "coming soon"
// Using a construction/building animation
const constructionAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Construction",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Circle",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {"a": 1, "k": [{"t": 0, "s": [0]}, {"t": 60, "s": [360]}]},
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ind": 0,
              "ty": "sh",
              "ks": {
                "a": 0,
                "k": {
                  "i": [[0, -22.091], [22.091, 0], [0, 22.091], [-22.091, 0]],
                  "o": [[0, 22.091], [-22.091, 0], [0, -22.091], [22.091, 0]],
                  "v": [[40, 0], [0, 40], [-40, 0], [0, -40]],
                  "c": true
                }
              }
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0.2, 0.4, 0.8, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 4}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ]
    }
  ]
};

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  description = 'This feature is under development and will be available soon.',
  backUrl = '/dashboard',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with navigation */}
      <DashboardHeader userEmail={user?.email} />
      <PrimaryNavigationBar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center">
          {/* Lottie Animation */}
          <div className="w-48 h-48 mx-auto mb-6">
            <Lottie
              animationData={constructionAnimation}
              loop={true}
              autoplay={true}
            />
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">{description}</p>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              We're working hard to bring you this feature. Check back soon!
            </p>
          </div>

          {/* Back Button */}
          <Button onClick={() => navigate(backUrl)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ComingSoon;
