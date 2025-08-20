import { artifactTemplates } from "../lib/templates";

export default function Marketplace() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Component Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artifactTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">{template.preview}</div>
            <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
            <p className="text-gray-600 mb-4">{template.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">{template.author}</div>
              <div className="text-sm font-bold text-blue-600">
                {template.downloads} downloads
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
