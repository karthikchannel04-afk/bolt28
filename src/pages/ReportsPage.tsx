import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Filter, BarChart3, 
  TrendingUp, Users, Clock, DollarSign, Eye,
  Printer, Share2, Search
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAnalytics, updateAnalyticsFromCurrentData, generateTimeSeriesData } from '../utils/analyticsManager';

function ReportsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [therapistSpecificData, setTherapistSpecificData] = useState<any>(null);

  useEffect(() => {
    // Load therapist-specific analytics data
    const therapistAnalytics = getTherapistSpecificAnalytics();
    setAnalytics(therapistAnalytics);
    setTherapistSpecificData(therapistAnalytics);
    
    // Generate time series data
    const timeData = generateTherapistTimeSeriesData();
    setTimeSeriesData(timeData);
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      const updatedAnalytics = getTherapistSpecificAnalytics();
      setAnalytics(updatedAnalytics);
      setTherapistSpecificData(updatedAnalytics);
      setTimeSeriesData(generateTherapistTimeSeriesData());
    }, 10000);
    
    // Listen for analytics updates
    const handleAnalyticsUpdate = () => {
      const updatedAnalytics = getTherapistSpecificAnalytics();
      setAnalytics(updatedAnalytics);
      setTherapistSpecificData(updatedAnalytics);
      setTimeSeriesData(generateTherapistTimeSeriesData());
    };
    
    window.addEventListener('mindcare-analytics-updated', handleAnalyticsUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mindcare-analytics-updated', handleAnalyticsUpdate);
    };
  }, []);

  // Function to get therapist-specific analytics
  const getTherapistSpecificAnalytics = () => {
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    
    // Filter bookings for current therapist
    const therapistBookings = allBookings.filter((booking: any) => 
      booking.therapistName === user?.name || booking.therapistId === user?.id
    );
    
    const completedSessions = therapistBookings.filter((b: any) => b.status === 'completed');
    const totalSessions = therapistBookings.length;
    const pendingSessions = therapistBookings.filter((b: any) => b.status === 'pending_confirmation').length;
    
    // Calculate revenue from therapist's completed bookings
    const totalRevenue = completedSessions.reduce((sum: number, booking: any) => {
      const amount = parseFloat(booking.amount?.replace('$', '') || '0');
      return sum + amount;
    }, 0);
    
    // Calculate unique patients for this therapist
    const uniquePatients = new Set(therapistBookings.map((b: any) => b.patientId));
    const totalPatients = uniquePatients.size;
    
    // Calculate this month's data
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const thisMonthBookings = therapistBookings.filter((b: any) => 
      new Date(b.date || b.createdAt) >= oneMonthAgo
    );
    const monthlyRevenue = thisMonthBookings
      .filter((b: any) => b.status === 'completed')
      .reduce((sum: number, booking: any) => {
        const amount = parseFloat(booking.amount?.replace('$', '') || '0');
        return sum + amount;
      }, 0);
    
    const newPatientsThisMonth = new Set(thisMonthBookings.map((b: any) => b.patientId)).size;
    
    return {
      overview: {
        totalSessions,
        completedSessions: completedSessions.length,
        pendingSessions,
        totalPatients,
        totalRevenue,
        monthlyRevenue,
        newPatientsThisMonth,
        sessionCompletionRate: totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0,
        averageSessionValue: completedSessions.length > 0 ? totalRevenue / completedSessions.length : 0,
        revenueGrowthRate: 18.2 // This could be calculated based on historical data
      }
    };
  };
  
  // Function to generate therapist-specific time series data
  const generateTherapistTimeSeriesData = () => {
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const therapistBookings = allBookings.filter((booking: any) => 
      booking.therapistName === user?.name || booking.therapistId === user?.id
    );
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Filter bookings for this month
      const monthBookings = therapistBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date || booking.createdAt);
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear();
      });
      
      const completedThisMonth = monthBookings.filter((b: any) => b.status === 'completed');
      const revenueThisMonth = completedThisMonth.reduce((sum: number, booking: any) => {
        const amount = parseFloat(booking.amount?.replace('$', '') || '0');
        return sum + amount;
      }, 0);
      
      return {
        month: monthName,
        sessions: completedThisMonth.length,
        revenue: revenueThisMonth
      };
    });
    
    return last6Months;
  };
  // Generate session data from therapist-specific time series
  const sessionData = timeSeriesData;
  
  const patientProgress = [
    { name: 'Excellent Progress', value: 35, color: '#10B981' },
    { name: 'Good Progress', value: 40, color: '#3B82F6' },
    { name: 'Moderate Progress', value: 20, color: '#F59E0B' },
    { name: 'Needs Attention', value: 5, color: '#EF4444' }
  ];


  const reports = [
    {
      id: 'patient-progress',
      title: 'Patient Progress Report',
      description: 'Detailed analysis of patient treatment outcomes',
      lastGenerated: '2024-01-15',
      type: 'PDF'
    },
    {
      id: 'session-summary',
      title: 'Monthly Session Summary',
      description: 'Overview of all therapy sessions conducted',
      lastGenerated: '2024-01-14',
      type: 'Excel'
    },
    {
      id: 'revenue-analysis',
      title: 'Revenue Analysis',
      description: 'Financial performance and billing summary',
      lastGenerated: '2024-01-13',
      type: 'PDF'
    },
    {
      id: 'treatment-outcomes',
      title: 'Treatment Outcomes',
      description: 'Success rates and therapy effectiveness metrics',
      lastGenerated: '2024-01-12',
      type: 'PDF'
    }
  ];

  const generateNewReport = () => {
    const newReport = {
      id: `report-${Date.now()}`,
      title: 'Custom Practice Report',
      description: 'Comprehensive analysis of your practice performance',
      lastGenerated: new Date().toISOString().split('T')[0],
      type: 'PDF'
    };
    
    // Generate report content
    const reportContent = generateReportContent(newReport);
    downloadGeneratedReport(reportContent, newReport.title);
    
    toast.success('New report generated and downloaded!');
  };

  const viewReport = (report: any) => {
    // Generate and display report content
    const reportContent = generateReportContent(report);
    
    // Create a new window to display the report
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
              h2 { color: #3B82F6; margin-top: 30px; }
              .metric { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; }
              .highlight { background: #e7f3ff; padding: 5px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Therapist:</strong> ${user?.name}</p>
            <hr>
            ${reportContent}
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
    
    toast.success('Report opened in new window');
  };

  const downloadReport = (report: any) => {
    const reportContent = generateReportContent(report);
    downloadGeneratedReport(reportContent, report.title);
    toast.success(`${report.title} downloaded successfully!`);
  };

  const shareReport = (report: any) => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: report.description,
        url: window.location.href
      }).then(() => {
        toast.success('Report shared successfully!');
      }).catch(() => {
        copyReportLink(report);
      });
    } else {
      copyReportLink(report);
    }
  };

  const copyReportLink = (report: any) => {
    const reportUrl = `${window.location.origin}/reports/${report.id}`;
    navigator.clipboard.writeText(reportUrl).then(() => {
      toast.success('Report link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const generateReportContent = (report: any) => {
    if (!analytics) return '<p>No data available</p>';
    
    let content = '';
    
    switch (report.id) {
      case 'patient-progress':
        content = `
          <h2>Patient Progress Overview</h2>
          <div class="metric">
            <strong>Total Patients:</strong> <span class="highlight">${analytics.overview.totalPatients}</span>
          </div>
          <div class="metric">
            <strong>New Patients This Month:</strong> <span class="highlight">${analytics.overview.newPatientsThisMonth}</span>
          </div>
          <div class="metric">
            <strong>Session Completion Rate:</strong> <span class="highlight">${analytics.overview.sessionCompletionRate.toFixed(1)}%</span>
          </div>
          
          <h2>Patient Progress Distribution</h2>
          ${patientProgress.map(p => `
            <div class="metric">
              <strong>${p.name}:</strong> ${p.value}% of patients
            </div>
          `).join('')}
          
          <h2>Recommendations</h2>
          <ul>
            <li>Continue monitoring patient engagement levels</li>
            <li>Focus on patients needing additional attention</li>
            <li>Maintain current therapeutic approaches for excellent progress patients</li>
          </ul>
        `;
        break;
        
      case 'session-summary':
        content = `
          <h2>Monthly Session Summary</h2>
          <div class="metric">
            <strong>Total Sessions:</strong> <span class="highlight">${analytics.overview.totalSessions}</span>
          </div>
          <div class="metric">
            <strong>Completed Sessions:</strong> <span class="highlight">${analytics.overview.completedSessions}</span>
          </div>
          <div class="metric">
            <strong>Pending Sessions:</strong> <span class="highlight">${analytics.overview.pendingSessions}</span>
          </div>
          <div class="metric">
            <strong>Average Session Value:</strong> <span class="highlight">$${analytics.overview.averageSessionValue.toFixed(2)}</span>
          </div>
          
          <h2>Session Trends</h2>
          ${timeSeriesData.map(data => `
            <div class="metric">
              <strong>${data.month}:</strong> ${data.sessions} sessions, $${data.revenue} revenue
            </div>
          `).join('')}
        `;
        break;
        
      case 'revenue-analysis':
        content = `
          <h2>Financial Performance</h2>
          <div class="metric">
            <strong>Total Revenue:</strong> <span class="highlight">$${analytics.overview.totalRevenue.toLocaleString()}</span>
          </div>
          <div class="metric">
            <strong>Monthly Revenue:</strong> <span class="highlight">$${analytics.overview.monthlyRevenue.toLocaleString()}</span>
          </div>
          <div class="metric">
            <strong>Revenue Growth Rate:</strong> <span class="highlight">+${analytics.overview.revenueGrowthRate}%</span>
          </div>
          <div class="metric">
            <strong>Average Session Value:</strong> <span class="highlight">$${analytics.overview.averageSessionValue.toFixed(2)}</span>
          </div>
          
          <h2>Revenue Breakdown by Month</h2>
          ${timeSeriesData.map(data => `
            <div class="metric">
              <strong>${data.month}:</strong> $${data.revenue.toLocaleString()}
            </div>
          `).join('')}
        `;
        break;
        
      case 'treatment-outcomes':
        content = `
          <h2>Treatment Effectiveness</h2>
          <div class="metric">
            <strong>Session Completion Rate:</strong> <span class="highlight">${analytics.overview.sessionCompletionRate.toFixed(1)}%</span>
          </div>
          <div class="metric">
            <strong>Patient Satisfaction:</strong> <span class="highlight">4.8/5.0</span>
          </div>
          
          <h2>Patient Outcomes</h2>
          ${patientProgress.map(p => `
            <div class="metric">
              <strong>${p.name}:</strong> ${p.value}% of patients showing this level of improvement
            </div>
          `).join('')}
          
          <h2>Success Metrics</h2>
          <ul>
            <li>High completion rates indicate effective therapeutic approach</li>
            <li>Majority of patients showing good to excellent progress</li>
            <li>Consistent session attendance demonstrates patient engagement</li>
          </ul>
        `;
        break;
        
      default:
        content = `
          <h2>Practice Overview</h2>
          <div class="metric">
            <strong>Total Sessions:</strong> <span class="highlight">${analytics.overview.totalSessions}</span>
          </div>
          <div class="metric">
            <strong>Total Patients:</strong> <span class="highlight">${analytics.overview.totalPatients}</span>
          </div>
          <div class="metric">
            <strong>Monthly Revenue:</strong> <span class="highlight">$${analytics.overview.monthlyRevenue.toLocaleString()}</span>
          </div>
        `;
    }
    
    return content;
  };

  const downloadGeneratedReport = (content: string, title: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.html`;
    
    const fullContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto;
            }
            h1 { 
              color: #8B5CF6; 
              border-bottom: 2px solid #8B5CF6; 
              padding-bottom: 10px; 
            }
            h2 { 
              color: #3B82F6; 
              margin-top: 30px; 
              margin-bottom: 15px;
            }
            .metric { 
              background: #f8f9fa; 
              padding: 15px; 
              margin: 10px 0; 
              border-radius: 8px; 
              border-left: 4px solid #8B5CF6;
            }
            .highlight { 
              background: #e7f3ff; 
              padding: 3px 6px; 
              border-radius: 4px; 
              font-weight: bold;
            }
            ul { 
              background: #f0f9ff; 
              padding: 15px 30px; 
              border-radius: 8px; 
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #8B5CF6, #3B82F6);
              color: white;
              border-radius: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: white; border: none; margin: 0;">${title}</h1>
            <p style="margin: 5px 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0 0 0;">Therapist: ${user?.name}</p>
          </div>
          ${content}
          <hr style="margin: 40px 0;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Generated by MindCare Platform • ${new Date().toLocaleDateString()}
          </p>
        </body>
      </html>
    `;
    
    const blob = new Blob([fullContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    if (!analytics) {
      toast.error('No analytics data available');
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Generate comprehensive report with all data
      const comprehensiveContent = `
        <div class="header">
          <h1 style="color: white; border: none; margin: 0;">Complete Practice Analytics Report</h1>
          <p style="margin: 5px 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0;">Therapist: ${user?.name}</p>
        </div>
        
        <h2>Executive Summary</h2>
        <div class="metric">
          <strong>Practice Overview:</strong> Your practice has conducted <span class="highlight">${analytics.overview.totalSessions}</span> 
          sessions with <span class="highlight">${analytics.overview.totalPatients}</span> patients, generating 
          <span class="highlight">$${analytics.overview.totalRevenue.toLocaleString()}</span> in total revenue.
        </div>
        
        <h2>Key Performance Indicators</h2>
        <div class="metric">
          <strong>Session Completion Rate:</strong> <span class="highlight">${analytics.overview.sessionCompletionRate.toFixed(1)}%</span>
        </div>
        <div class="metric">
          <strong>Average Session Value:</strong> <span class="highlight">$${analytics.overview.averageSessionValue.toFixed(2)}</span>
        </div>
        <div class="metric">
          <strong>Monthly Revenue:</strong> <span class="highlight">$${analytics.overview.monthlyRevenue.toLocaleString()}</span>
        </div>
        <div class="metric">
          <strong>Revenue Growth Rate:</strong> <span class="highlight">+${analytics.overview.revenueGrowthRate}%</span>
        </div>
        
        <h2>Patient Progress Analysis</h2>
        ${patientProgress.map(p => `
          <div class="metric">
            <strong>${p.name}:</strong> <span class="highlight">${p.value}%</span> of your patients
          </div>
        `).join('')}
        
        <h2>Monthly Performance Trends</h2>
        ${timeSeriesData.map(data => `
          <div class="metric">
            <strong>${data.month}:</strong> ${data.sessions} sessions completed, $${data.revenue.toLocaleString()} revenue generated
          </div>
        `).join('')}
        
        <h2>Practice Insights & Recommendations</h2>
        <ul>
          <li><strong>Strengths:</strong> High session completion rate indicates effective therapeutic approach</li>
          <li><strong>Growth Opportunity:</strong> Consider expanding availability to accommodate more patients</li>
          <li><strong>Patient Care:</strong> Majority of patients showing positive progress</li>
          <li><strong>Financial Health:</strong> Steady revenue growth with consistent session values</li>
          <li><strong>Professional Development:</strong> Continue current therapeutic methods as they show strong results</li>
        </ul>
        
        <h2>Next Steps</h2>
        <ul>
          <li>Monitor patients in the "Needs Attention" category for additional support</li>
          <li>Consider group therapy sessions to increase capacity</li>
          <li>Maintain current scheduling and session structure</li>
          <li>Continue tracking patient progress for ongoing insights</li>
        </ul>
      `;
      
      const fullReport = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Complete Practice Analytics Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                line-height: 1.6; 
                max-width: 800px; 
                margin: 0 auto;
                color: #333;
              }
              h1 { 
                color: #8B5CF6; 
                border-bottom: 2px solid #8B5CF6; 
                padding-bottom: 10px; 
              }
              h2 { 
                color: #3B82F6; 
                margin-top: 30px; 
                margin-bottom: 15px;
              }
              .metric { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 8px; 
                border-left: 4px solid #8B5CF6;
              }
              .highlight { 
                background: #e7f3ff; 
                padding: 3px 6px; 
                border-radius: 4px; 
                font-weight: bold;
                color: #1e40af;
              }
              ul { 
                background: #f0f9ff; 
                padding: 15px 30px; 
                border-radius: 8px; 
                margin: 15px 0;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #8B5CF6, #3B82F6);
                color: white;
                border-radius: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            ${comprehensiveContent}
            <div class="footer">
              Generated by MindCare Platform • ${new Date().toLocaleDateString()} • Confidential Report
            </div>
          </body>
        </html>
      `;
      
      const blob = new Blob([fullReport], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `complete-practice-report-${timestamp}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Complete practice report exported successfully!');
    } catch (error) {
      toast.error('Failed to export reports');
      console.error('Export error:', error);
    }
  };
  const stats = analytics ? [
    {
      title: 'Total Sessions',
      value: analytics.overview.totalSessions.toString(),
      change: `${analytics.overview.completedSessions} completed`,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Patients',
      value: analytics.overview.totalPatients.toString(),
      change: `${analytics.overview.newPatientsThisMonth} new this month`,
      icon: Users,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Monthly Revenue',
      value: `$${analytics.overview.monthlyRevenue.toLocaleString()}`,
      change: `+${analytics.overview.revenueGrowthRate}% from last month`,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Completion Rate',
      value: `${analytics.overview.sessionCompletionRate.toFixed(1)}%`,
      change: 'Session completion',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ] : [];

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Reports & Analytics
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track your practice performance and patient outcomes
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Showing data for: {user?.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </h3>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="overview">Overview</option>
                <option value="patients">Patient Analytics</option>
                <option value="sessions">Session Analytics</option>
                <option value="revenue">Revenue Analytics</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Sessions & Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Sessions & Revenue Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Sessions"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Patient Progress Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Patient Progress Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={patientProgress}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patientProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Therapy Types Analysis */}

        {/* Generated Reports */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Generated Reports
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => generateNewReport()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                <FileText className="w-4 h-4" />
                <span>Generate New</span>
              </button>
              <button 
                onClick={() => exportAllReports()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-700/50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {report.title}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.type === 'PDF' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {report.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewReport(report)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => downloadReport(report)}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => shareReport(report)}
                      className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                      title="Share Report"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ReportsPage;