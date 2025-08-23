'use client';

import { AlertTriangle, CheckCircle, Eye, Monitor, Palette, Smartphone,TrendingUp, Users, Zap } from "lucide-react";
import React, { useEffect,useState } from 'react';
import { Bar, BarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,XAxis, YAxis } from 'recharts';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAccessibilityReport, generateResponsiveReport } from "@/lib/uiEnhancer";
import { DesignSystemMetrics, uiImprovements, UIImprovementSuggestion } from "@/lib/uiImprovements";
import { Artifact } from "@/types/artifact";

interface UIAnalyzerProps {
  artifact: Artifact;
  onApplyImprovement?: (suggestion: UIImprovementSuggestion) => void;
}

export function UIAnalyzer({ artifact, onApplyImprovement }: UIAnalyzerProps) {
  const [metrics, setMetrics] = useState<DesignSystemMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<UIImprovementSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [accessibilityReport, setAccessibilityReport] = useState<any>(null);
  const [responsiveReport, setResponsiveReport] = useState<any>(null);

  useEffect(() => {
    analyzeArtifact();
  }, [artifact]); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeArtifact = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate analysis delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const components = artifact.components || [];
      
      // Generate metrics
      const designMetrics = uiImprovements.analyzeDesignSystem(artifact);
      setMetrics(designMetrics);

      // Generate improvement suggestions
      const improvementSuggestions = uiImprovements.generateImprovementSuggestions(artifact);
      setSuggestions(improvementSuggestions);

      // Generate detailed reports
      const accessReport = generateAccessibilityReport(components);
      setAccessibilityReport(accessReport);

      const respReport = generateResponsiveReport(components);
      setResponsiveReport(respReport);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };


  if (isAnalyzing || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Analyzing UI/UX...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Analyzing design system and user experience...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const radarData = [
    { subject: 'Accessibility', value: metrics.accessibility, fullMark: 100 },
    { subject: 'Consistency', value: metrics.consistency, fullMark: 100 },
    { subject: 'Performance', value: metrics.performance, fullMark: 100 },
    { subject: 'Usability', value: metrics.usability, fullMark: 100 },
    { subject: 'Maintainability', value: metrics.maintainability, fullMark: 100 },
  ];

  const barData = [
    { name: 'Accessibility', value: metrics.accessibility },
    { name: 'Consistency', value: metrics.consistency },
    { name: 'Performance', value: metrics.performance },
    { name: 'Usability', value: metrics.usability },
    { name: 'Maintainability', value: metrics.maintainability },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Design System Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(metrics.overall)}`}>
              {metrics.overall}/100
            </div>
            <p className="text-muted-foreground mt-2">Overall Design System Score</p>
            <Progress value={metrics.overall} className="mt-4" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Metrics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Design Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-value)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Design System Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Score",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="var(--color-value)"
                        fill="var(--color-value)"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Score Details */}
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { label: 'Accessibility', value: metrics.accessibility, icon: Users },
              { label: 'Consistency', value: metrics.consistency, icon: Palette },
              { label: 'Performance', value: metrics.performance, icon: Zap },
              { label: 'Usability', value: metrics.usability, icon: Monitor },
              { label: 'Maintainability', value: metrics.maintainability, icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                    {value}
                  </div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          {accessibilityReport && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(accessibilityReport.score)}`}>
                      {accessibilityReport.score}/100
                    </div>
                    <p className="text-sm text-muted-foreground">Accessibility Score</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {accessibilityReport.issues.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Issues Found</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${accessibilityReport.compliance.wcagAA ? 'text-green-600' : 'text-red-600'}`}>
                      {accessibilityReport.compliance.wcagAA ? 'PASS' : 'FAIL'}
                    </div>
                    <p className="text-sm text-muted-foreground">WCAG AA</p>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { label: 'WCAG AA', status: accessibilityReport.compliance.wcagAA },
                      { label: 'WCAG AAA', status: accessibilityReport.compliance.wcagAAA },
                      { label: 'Section 508', status: accessibilityReport.compliance.section508 },
                      { label: 'ADA', status: accessibilityReport.compliance.ada },
                    ].map(({ label, status }) => (
                      <div key={label} className="flex items-center gap-2">
                        {status ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={status ? 'text-green-600' : 'text-red-600'}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility Issues */}
              {accessibilityReport.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {accessibilityReport.issues.map((issue: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={getPriorityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                  <Badge variant="outline">{issue.type}</Badge>
                                </div>
                                <h4 className="font-semibold mb-2">{issue.description}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Element: {issue.element}
                                </p>
                                <p className="text-sm">{issue.fix}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {issue.wcagReference}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Responsive Tab */}
        <TabsContent value="responsive" className="space-y-6">
          {responsiveReport && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className={`text-2xl font-bold ${getScoreColor(responsiveReport.flexibilityScore)}`}>
                      {responsiveReport.flexibilityScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Responsive Flexibility</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-bold text-orange-600">
                      {responsiveReport.issues.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Responsive Issues</p>
                  </CardContent>
                </Card>
              </div>

              {/* Breakpoint Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Breakpoint Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {responsiveReport.breakpoints.map((bp: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold capitalize">{bp.name}</h4>
                            <Badge variant="outline">{bp.width}px</Badge>
                          </div>
                          <div className={`text-sm font-medium ${getScoreColor(bp.score)}`}>
                            {bp.score}/100
                          </div>
                        </div>
                        <div className="mb-2">
                          <Progress value={bp.coverage} className="mb-1" />
                          <p className="text-sm text-muted-foreground">
                            {bp.coverage}% component coverage
                          </p>
                        </div>
                        {bp.issues.length > 0 && (
                          <div className="text-sm text-orange-600">
                            {bp.issues.length} issue(s) found
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                UI/UX Improvement Suggestions
                <Badge variant="outline">{suggestions.length} suggestions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {suggestions.map((suggestion, _index) => (
                    <div key={suggestion.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                          <Badge variant="outline">{suggestion.type}</Badge>
                        </div>
                        {onApplyImprovement && (
                          <Button
                            size="sm"
                            onClick={() => onApplyImprovement(suggestion)}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                      
                      <h4 className="font-semibold mb-2">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Component: {suggestion.component}
                      </p>
                      <p className="text-sm mb-3">{suggestion.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Impact:</span> {suggestion.impact}
                        </div>
                        <div>
                          <span className="font-medium">Effort:</span> {suggestion.effort}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {suggestion.type}
                        </div>
                      </div>

                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          Implementation Details
                        </summary>
                        <p className="text-sm text-muted-foreground mt-2 pl-4">
                          {suggestion.implementation}
                        </p>
                      </details>
                    </div>
                  ))}
                  
                  {suggestions.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-lg font-semibold mb-2">Great job!</h3>
                      <p className="text-muted-foreground">
                        No improvement suggestions found. Your design system is in excellent shape.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const cssTheme = uiImprovements.exportThemeAsCSS();
                    const blob = new Blob([cssTheme], { type: 'text/css' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'theme.css';
                    a.click();
                  }}
                >
                  Export Theme as CSS
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const tailwindConfig = uiImprovements.exportThemeAsTailwind();
                    const blob = new Blob([tailwindConfig], { type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tailwind.config.js';
                    a.click();
                  }}
                >
                  Export Tailwind Config
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const report = {
                      metrics,
                      suggestions,
                      accessibility: accessibilityReport,
                      responsive: responsiveReport,
                      timestamp: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'ui-analysis-report.json';
                    a.click();
                  }}
                >
                  Export Full Report
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Components Analyzed:</span>
                    <span className="font-medium">{artifact.components?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues Found:</span>
                    <span className="font-medium text-orange-600">
                      {(accessibilityReport?.issues?.length || 0) + (responsiveReport?.issues?.length || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suggestions:</span>
                    <span className="font-medium">{suggestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <span className={`font-medium ${getScoreColor(metrics.overall)}`}>
                      {metrics.overall}/100
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
