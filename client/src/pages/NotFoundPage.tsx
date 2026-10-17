import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The requested page does not exist or has been moved to another route in the Applicant
        Tracking System.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={<Home className="h-4 w-4" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
