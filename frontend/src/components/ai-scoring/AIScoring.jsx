import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  ChevronRight
} from 'lucide-react';

const AIScoring = ({ formData }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Realistic scoring based on actual form data
  const calculateAccuracyScore = () => {
    let score = 0;
    if (formData.fullName) score += 15;
    if (formData.email) score += 10;
    if (formData.technicalSkills.length >= 5) score += 20;
    else if (formData.technicalSkills.length >= 3) score += 15;
    else score += 10;
    if (formData.role && formData.company) score += 15;
    if (formData.education) score += 10;
    if (formData.duration) score += 10;
    if (formData.nonTechnicalSkills.length >= 3) score += 10;
    if (formData.languages.length >= 2) score += 5;
    if (formData.certifications.length >= 1) score += 5;
    return Math.min(score, 100);
  };

  const calculateATSScore = () => {
    let score = 0;
    if (formData.technicalSkills.length >= 5) score += 30;
    else if (formData.technicalSkills.length >= 3) score += 20;
    if (formData.desiredRole) score += 15;
    if (formData.role && formData.company && formData.duration) score += 20;
    if (formData.education) score += 15;
    if (formData.email.includes('@')) score += 10;
    if (formData.certifications.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const calculateImpactScore = () => {
    let score = 0;
    if (formData.technicalSkills.length >= 6) score += 25;
    else if (formData.technicalSkills.length >= 4) score += 20;
    if (formData.nonTechnicalSkills.length >= 4) score += 15;
    else if (formData.nonTechnicalSkills.length >= 2) score += 10;
    if (formData.role) score += 20;
    if (formData.certifications.length >= 2) score += 20;
    else if (formData.certifications.length >= 1) score += 10;
    if (formData.languages.length >= 2) score += 10;
    return Math.min(score, 100);
  };

  const accuracyScore = calculateAccuracyScore();
  const atsScore = calculateATSScore();
  const impactScore = calculateImpactScore();

  const ScoreCard = ({ title, score, icon: Icon, color }) => (
    <Card className="p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <Badge 
          variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}
          className="text-xs"
        >
          {score}%
        </Badge>
      </div>
      <Progress value={score} className="h-2" />
      <p className="text-xs text-gray-600 mt-2">
        {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
      </p>
    </Card>
  );

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-sky-500" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <p className="text-xs text-gray-600">
          Live analysis of your resume quality
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="ats" className="text-xs">ATS Match</TabsTrigger>
          <TabsTrigger value="gaps" className="text-xs">Skills Gap</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <TabsContent value="overview" className="m-0 space-y-4">
              <ScoreCard
                title="AI Accuracy"
                score={accuracyScore}
                icon={Brain}
                color="text-sky-500"
              />
              <ScoreCard
                title="ATS Match"
                score={atsScore}
                icon={Target}
                color="text-orange-500"
              />
              <ScoreCard
                title="Impact Score"
                score={impactScore}
                icon={TrendingUp}
                color="text-green-500"
              />

              <Card className="p-4 bg-sky-50 border-sky-200">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-500" />
                  Top Recommendations
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Add quantifiable achievements with metrics</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Include {formData.desiredRole} keywords</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span>Consider adding certifications section</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ats" className="m-0 space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-3">Keyword Coverage</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Technical Skills</span>
                      <span className="text-green-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Soft Skills</span>
                      <span className="text-orange-600">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Industry Terms</span>
                      <span className="text-sky-600">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-2">Readability</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Grade Level: 8 (Target: 7-10)
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Excellent for ATS
                </Badge>
              </Card>

              <Button size="sm" variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Optimize for Job Description
              </Button>
            </TabsContent>

            <TabsContent value="gaps" className="m-0 space-y-4">
              <Card className="p-4 border-orange-200">
                <h4 className="font-semibold text-sm mb-3 text-orange-600">Must-Have Gaps</h4>
                <div className="space-y-2">
                  {formData.desiredRole.toLowerCase().includes('engineer') && (
                    <>
                      <div className="text-xs p-2 bg-orange-50 rounded">
                        <div className="font-medium mb-1">System Design</div>
                        <p className="text-gray-600">
                          Add experience with scalable architectures
                        </p>
                      </div>
                      <div className="text-xs p-2 bg-orange-50 rounded">
                        <div className="font-medium mb-1">Cloud Platforms</div>
                        <p className="text-gray-600">
                          Consider AWS/Azure certifications
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-4 border-green-200">
                <h4 className="font-semibold text-sm mb-3 text-green-600">Nice-to-Have</h4>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    Docker/Kubernetes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    CI/CD Pipelines
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Agile Methodologies
                  </Badge>
                </div>
              </Card>

              <Button size="sm" className="w-full bg-gradient-to-r from-sky-500 to-orange-500">
                <ChevronRight className="w-4 h-4 mr-2" />
                Get 30-Day Upskill Plan
              </Button>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

export default AIScoring;

