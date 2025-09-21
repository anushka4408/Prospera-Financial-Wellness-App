import React, { useState } from "react";
import PageLayout from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useGenerateBudgetForecastMutation, useGetLatestBudgetForecastQuery } from "@/features/budget-forecast/budgetForecastAPI";
import { BudgetForecastResponseData } from "@/features/budget-forecast/types";

const BudgetForecastPage = () => {
	const [months, setMonths] = useState(12);
	const [horizonMonths, setHorizonMonths] = useState(3);
	const [granularity, setGranularity] = useState<"monthly" | "weekly">("monthly");
	const [savingsTargetPercent, setSavingsTargetPercent] = useState<string>("");
	const [forecast, setForecast] = useState<BudgetForecastResponseData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [generateForecast, { isLoading }] = useGenerateBudgetForecastMutation();
	const { data: latestResponse, refetch } = useGetLatestBudgetForecastQuery();

	const onGenerate = async () => {
		try {
			const body: GenerateBudgetForecastRequestBody = {
				months,
				horizonMonths,
				granularity,
			};
			if (savingsTargetPercent) body.savingsTargetPercent = Number(savingsTargetPercent);
			const res = await generateForecast(body).unwrap();
			setForecast(res.data);
			setError(null); // Clear any previous errors
			refetch();
		} catch (error: unknown) {
			// Handle insufficient data error
			if (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data && typeof error.data.message === 'string' && error.data.message.includes('Insufficient data')) {
				setForecast(null);
				setError(error.data.message);
			} else {
				setError('Failed to generate budget forecast. Please try again.');
				console.error('Budget forecast generation failed:', error);
			}
		}
	};

	React.useEffect(() => {
		if (latestResponse?.data?.result) {
			setForecast(latestResponse.data.result as BudgetForecastResponseData);
		}
	}, [latestResponse]);

	return (
		<PageLayout title="Budget Forecast" subtitle="AI-powered forecast and category recommendations">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Parameters</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="text-sm text-gray-600">History Months</label>
						<Input type="number" value={months} min={6} max={12} onChange={(e) => setMonths(Number(e.target.value))} />
					</div>
					<div>
						<label className="text-sm text-gray-600">Horizon Months</label>
						<Input type="number" value={horizonMonths} min={1} max={6} onChange={(e) => setHorizonMonths(Number(e.target.value))} />
					</div>
					<div>
						<label className="text-sm text-gray-600">Granularity</label>
						<Select value={granularity} onValueChange={(v) => setGranularity(v as "monthly" | "weekly")}>
							<SelectTrigger>
								<SelectValue placeholder="Select granularity" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="monthly">Monthly</SelectItem>
								<SelectItem value="weekly">Weekly</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<label className="text-sm text-gray-600">Savings Target % (optional)</label>
						<Input type="number" value={savingsTargetPercent} onChange={(e) => setSavingsTargetPercent(e.target.value)} />
					</div>
					<div className="md:col-span-4">
						<Button onClick={onGenerate} disabled={isLoading}>{isLoading ? "Generating..." : "Generate Forecast"}</Button>
					</div>
				</CardContent>
			</Card>

			{/* Error Display */}
			{error && (
				<Card className="mb-6 border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="text-red-800">⚠️ Insufficient Data</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-red-700 text-sm">
							<p className="mb-3">{error}</p>
							<div className="bg-white p-3 rounded border border-red-200">
								<h4 className="font-semibold text-red-800 mb-2">Data Requirements for Budget Forecasting:</h4>
								<ul className="space-y-1 text-sm">
									<li>• <strong>Minimum transactions:</strong> 10 transactions over the selected period</li>
									<li>• <strong>Category diversity:</strong> At least 3 different spending categories</li>
									<li>• <strong>Time period:</strong> 6-12 months of transaction history</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{forecast && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>AI Budget Forecast Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Overall Summary */}
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h3 className="font-semibold text-blue-800 mb-2">Forecast Overview</h3>
							<p className="text-blue-700 text-sm">
								Based on your {months}-month spending history, here's your recommended budget for the next {forecast.horizonMonths} {forecast.granularity} periods.
								The AI analyzed your spending patterns, seasonal trends, and recurring expenses to provide personalized recommendations.
							</p>
						</div>

						{/* Key Metrics */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">${forecast.totalBudgetPerPeriod}</div>
								<div className="text-sm text-gray-600">Total per {forecast.granularity}</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-green-600">{forecast.categories.length}</div>
								<div className="text-sm text-gray-600">Categories</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-orange-600">{Math.round((forecast.confidence.overall || 0) * 100)}%</div>
								<div className="text-sm text-gray-600">Confidence</div>
							</div>
						</div>

						{/* Confidence Bar */}
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-600">Overall Confidence</div>
							<div className="w-1/2">
								<Progress value={Math.round((forecast.confidence.overall || 0) * 100)} />
							</div>
							<div className="text-sm font-medium">{Math.round((forecast.confidence.overall || 0) * 100)}%</div>
						</div>

						{/* Chart Visualizations */}
						<div className="space-y-6">
							{/* Category Distribution Chart */}
							<div>
								<h3 className="font-semibold text-gray-800 mb-4">Category Budget Distribution</h3>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={forecast.categories.map(cat => ({
											name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
											recommended: cat.recommendedAmount,
											min: cat.min,
											max: cat.max
										}))}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
											<Bar dataKey="recommended" fill="#3b82f6" name="Recommended" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>

							{/* Pie Chart for Category Proportions */}
							<div>
								<h3 className="font-semibold text-gray-800 mb-4">Budget Allocation by Category</h3>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={forecast.categories.map(cat => ({
													name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
													value: cat.recommendedAmount
												}))}
												cx="50%"
												cy="50%"
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
												label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											>
												{forecast.categories.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]} />
												))}
											</Pie>
											<Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>

						{/* Detailed Category Cards */}
						<div>
							<h3 className="font-semibold text-gray-800 mb-4">Detailed Category Breakdown</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{forecast.categories.map((c) => (
									<Card key={c.name} className="border hover:shadow-md transition-shadow">
										<CardContent className="pt-4">
											<div className="font-medium capitalize text-gray-800 mb-2">{c.name}</div>
											<div className="space-y-2">
												<div className="flex justify-between items-center">
													<span className="text-sm text-gray-600">Recommended:</span>
													<span className="font-semibold text-blue-600">${c.recommendedAmount}</span>
												</div>
												<div className="flex justify-between items-center">
													<span className="text-sm text-gray-600">Range:</span>
													<span className="text-sm text-gray-700">${c.min} - ${c.max}</span>
												</div>
												<div className="flex justify-between items-center">
													<span className="text-sm text-gray-600">Confidence:</span>
													<span className="text-sm text-gray-700">{Math.round(c.confidence * 100)}%</span>
												</div>
											</div>
											{c.reasoning && (
												<div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
													<strong>AI Reasoning:</strong> {c.reasoning}
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						{/* Assumptions and Risks */}
						{(forecast.assumptions || forecast.risks) && (
							<div className="space-y-4">
								{forecast.assumptions && forecast.assumptions.length > 0 && (
									<div>
										<h3 className="font-semibold text-green-700 mb-2">Key Assumptions</h3>
										<ul className="space-y-1">
											{forecast.assumptions.map((assumption, index) => (
												<li key={index} className="text-sm text-gray-600 flex items-start gap-2">
													<span className="text-green-500">•</span>
													{assumption}
												</li>
											))}
										</ul>
									</div>
								)}
								{forecast.risks && forecast.risks.length > 0 && (
									<div>
										<h3 className="font-semibold text-orange-700 mb-2">Potential Risks</h3>
										<ul className="space-y-1">
											{forecast.risks.map((risk, index) => (
												<li key={index} className="text-sm text-gray-600 flex items-start gap-2">
													<span className="text-orange-500">•</span>
													{risk}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</PageLayout>
	);
};

export default BudgetForecastPage;


