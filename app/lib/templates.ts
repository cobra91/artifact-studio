import { ArtifactTemplate, ComponentNode } from '../types/artifact'

export const artifactTemplates: ArtifactTemplate[] = [
  {
    id: 'calculator',
    name: 'Loan Calculator',
    description: 'Interactive loan calculator with sliders and real-time calculations',
    category: 'Finance',
    preview: '🧮',
    code: `// Loan Calculator Component
export const LoanCalculator = () => {
  const [amount, setAmount] = useState(100000)
  const [rate, setRate] = useState(5.5)
  const [term, setTerm] = useState(30)
  
  const monthlyPayment = (amount * (rate/100/12)) / (1 - Math.pow(1 + rate/100/12, -(term*12)))
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Loan Calculator</h2>
      {/* Calculator implementation */}
    </div>
  )
}`,
    components: []
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Modern dashboard with charts, metrics, and data visualization',
    category: 'Analytics',
    preview: '📊',
    code: `// Analytics Dashboard Component
export const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      {/* Dashboard implementation */}
    </div>
  )
}`,
    components: []
  },
  {
    id: 'form',
    name: 'Contact Form',
    description: 'Responsive contact form with validation and submission handling',
    category: 'Forms',
    preview: '📝',
    code: `// Contact Form Component
export const ContactForm = () => {
  const [formData, setFormData] = useState({})
  
  return (
    <form className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      {/* Form implementation */}
    </form>
  )
}`,
    components: []
  },
  {
    id: 'quiz',
    name: 'Interactive Quiz',
    description: 'Multi-question quiz with scoring and progress tracking',
    category: 'Education',
    preview: '🎯',
    code: `// Interactive Quiz Component
export const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">React Quiz</h2>
      {/* Quiz implementation */}
    </div>
  )
}`,
    components: []
  },
  {
    id: 'pricing',
    name: 'Pricing Table',
    description: 'Responsive pricing table with feature comparison and CTAs',
    category: 'Marketing',
    preview: '💰',
    code: `// Pricing Table Component
export const PricingTable = () => {
  return (
    <div className="py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
      {/* Pricing table implementation */}
    </div>
  )
}`,
    components: []
  },
  {
    id: 'todo',
    name: 'Todo List',
    description: 'Task management app with drag & drop and local storage',
    category: 'Productivity',
    preview: '✅',
    code: `// Todo List Component
export const TodoList = () => {
  const [todos, setTodos] = useState([])
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">My Tasks</h2>
      {/* Todo list implementation */}
    </div>
  )
}`,
    components: []
  }
]

export const getTemplatesByCategory = (category?: string) => {
  if (!category) return artifactTemplates
  return artifactTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string) => {
  return artifactTemplates.find(template => template.id === id)
}