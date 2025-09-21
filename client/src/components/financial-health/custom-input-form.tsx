import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomFinancialInput } from '@/features/financial-health/types';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Target, 
  Shield, 
  Home, 
  GraduationCap,
  Heart,
  UserCheck,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface CustomInputFormProps {
  onSubmit: (data: CustomFinancialInput) => void;
  isLoading: boolean;
}

const CustomInputForm: React.FC<CustomInputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CustomFinancialInput>({
    // Basic Financial Information
    monthlyIncome: 0,
    monthlyBudget: 0,
    totalDebt: 0,
    emergencyFund: 0,
    netWorth: 0,
    
    // Life Circumstances
    age: 25,
    familySize: 1,
    careerStage: 'early-career',
    location: '',
    costOfLiving: 'medium',
    
    // Financial Goals
    primaryGoal: 'savings',
    timeHorizon: 'medium-term',
    riskTolerance: 'moderate',
    
    // Custom Metrics
    investmentPortfolio: 0,
    insuranceCoverage: 'basic',
    housingType: 'renting',
    dependents: 0,
    
    // Additional Context
    healthStatus: 'good',
    educationLevel: 'bachelor',
    maritalStatus: 'single',
    hasChildren: false,
  });

  const handleInputChange = (field: keyof CustomFinancialInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Custom Financial Health Assessment
          </CardTitle>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Provide detailed information about your financial situation and life circumstances for a comprehensive, personalized analysis tailored to your specific needs and goals.
          </p>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Financial Information */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-green-800">Financial Overview</CardTitle>
                <p className="text-sm text-green-600 mt-1">Your income, expenses, debts, and financial assets</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="monthlyIncome" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Monthly Income (₹)
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                  placeholder="50,000"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Your primary monthly income</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="monthlyBudget" className="text-sm font-medium flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                  Monthly Budget (₹)
                </Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.monthlyBudget || ''}
                  onChange={(e) => handleInputChange('monthlyBudget', Number(e.target.value))}
                  placeholder="40,000"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Total monthly expenses</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="totalDebt" className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-red-600" />
                  Total Debt (₹)
                </Label>
                <Input
                  id="totalDebt"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.totalDebt || ''}
                  onChange={(e) => handleInputChange('totalDebt', Number(e.target.value))}
                  placeholder="1,50,000"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">All outstanding debts</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="emergencyFund" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Emergency Fund (₹)
                </Label>
                <Input
                  id="emergencyFund"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.emergencyFund || ''}
                  onChange={(e) => handleInputChange('emergencyFund', Number(e.target.value))}
                  placeholder="1,00,000"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Savings for emergencies</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="netWorth" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  Net Worth (₹)
                </Label>
                <Input
                  id="netWorth"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.netWorth || ''}
                  onChange={(e) => handleInputChange('netWorth', Number(e.target.value))}
                  placeholder="5,00,000"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Assets minus liabilities</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="investmentPortfolio" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Investment Portfolio (₹)
                </Label>
                <Input
                  id="investmentPortfolio"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.investmentPortfolio || ''}
                  onChange={(e) => handleInputChange('investmentPortfolio', Number(e.target.value))}
                  placeholder="2,00,000"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Current investments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Life Circumstances */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-orange-800">Life Circumstances</CardTitle>
                <p className="text-sm text-orange-600 mt-1">Personal details that impact your financial planning</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="age" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', Number(e.target.value))}
                  min="18"
                  max="100"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Your current age</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="familySize" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  Family Size
                </Label>
                <Input
                  id="familySize"
                  type="number"
                  inputMode="numeric"
                  value={formData.familySize || ''}
                  onChange={(e) => handleInputChange('familySize', Number(e.target.value))}
                  min="1"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Total family members</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="careerStage" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  Career Stage
                </Label>
                <Select value={formData.careerStage} onValueChange={(value) => handleInputChange('careerStage', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="early-career">Early Career</SelectItem>
                    <SelectItem value="mid-career">Mid Career</SelectItem>
                    <SelectItem value="late-career">Late Career</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Current career phase</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Mumbai, Maharashtra"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">City and state</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="costOfLiving" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  Cost of Living
                </Label>
                <Select value={formData.costOfLiving} onValueChange={(value) => handleInputChange('costOfLiving', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select cost of living" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Relative to your area</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="dependents" className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-orange-600" />
                  Dependents
                </Label>
                <Input
                  id="dependents"
                  type="number"
                  inputMode="numeric"
                  value={formData.dependents || ''}
                  onChange={(e) => handleInputChange('dependents', Number(e.target.value))}
                  min="0"
                  className="h-11 w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">People you financially support</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-purple-800">Financial Goals & Preferences</CardTitle>
                <p className="text-sm text-purple-600 mt-1">Your financial objectives and risk preferences</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="primaryGoal" className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Primary Financial Goal
                </Label>
                <Select value={formData.primaryGoal} onValueChange={(value) => handleInputChange('primaryGoal', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Choose a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debt-reduction">Debt Reduction</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="emergency-fund">Emergency Fund</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Your main financial focus</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="timeHorizon" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Time Horizon
                </Label>
                <Select value={formData.timeHorizon} onValueChange={(value) => handleInputChange('timeHorizon', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-term">Short-term (1-3 years)</SelectItem>
                    <SelectItem value="medium-term">Medium-term (3-10 years)</SelectItem>
                    <SelectItem value="long-term">Long-term (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Planning timeframe</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="riskTolerance" className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-purple-600" />
                  Risk Tolerance
                </Label>
                <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Investment risk preference</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Context */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Shield className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-teal-800">Additional Context</CardTitle>
                <p className="text-sm text-teal-600 mt-1">Insurance, housing, health, and personal background</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="insuranceCoverage" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  Insurance Coverage
                </Label>
                <Select value={formData.insuranceCoverage} onValueChange={(value) => handleInputChange('insuranceCoverage', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="adequate">Adequate</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Current insurance level</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="housingType" className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-teal-600" />
                  Housing Type
                </Label>
                <Select value={formData.housingType} onValueChange={(value) => handleInputChange('housingType', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="renting">Renting</SelectItem>
                    <SelectItem value="owning">Owning (No Mortgage)</SelectItem>
                    <SelectItem value="mortgage">Owning (With Mortgage)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Current housing situation</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="healthStatus" className="text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-teal-600" />
                  Health Status
                </Label>
                <Select value={formData.healthStatus} onValueChange={(value) => handleInputChange('healthStatus', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Current health condition</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="educationLevel" className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-teal-600" />
                  Education Level
                </Label>
                <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange('educationLevel', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Highest education level</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label htmlFor="maritalStatus" className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-teal-600" />
                  Marital Status
                </Label>
                <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Current marital status</p>
              </div>
              
              <div className="space-y-2 min-h-[100px]">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  Have Children
                </Label>
                <div className="flex items-center space-x-3 h-11">
                  <input
                    type="checkbox"
                    id="hasChildren"
                    checked={formData.hasChildren}
                    onChange={(e) => handleInputChange('hasChildren', e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <Label htmlFor="hasChildren" className="text-sm font-medium cursor-pointer">
                    Yes, I have children
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">Do you have dependent children?</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Assessment...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    Generate Personalized Assessment
                  </span>
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Your information is secure and will be used only for generating your personalized financial health report.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CustomInputForm;

