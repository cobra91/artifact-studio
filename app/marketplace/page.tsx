"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// import { LiveCursors } from "../components/LiveCursors";

interface Template {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  preview: string;
  category: string;
}

export default function Marketplace() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    // Simplified templates for build success
    const mockTemplates: Template[] = [
      {
        id: "1",
        name: "Calculator",
        description: "A simple calculator component",
        author: "System",
        downloads: 100,
        rating: 4.5,
        preview: "/templates/calculator.png",
        category: "utility",
      },
      {
        id: "2",
        name: "Todo List",
        description: "A todo list component",
        author: "System",
        downloads: 200,
        rating: 4.8,
        preview: "/templates/todo.png",
        category: "productivity",
      },
    ];
    setTemplates(mockTemplates);
    setFilteredTemplates(mockTemplates);
  }, []);

  useEffect(() => {
    let result = templates;
    if (searchTerm) {
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (category) {
      result = result.filter(t => t.category === category);
    }
    setFilteredTemplates(result);
  }, [searchTerm, category, templates]);

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">Component Marketplace</h1>
        <div className="mb-8 flex">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full rounded-l-md border p-2"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="rounded-r-md border-t border-r border-b p-2"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="rounded-lg border p-6 transition-shadow hover:shadow-lg"
            >
              <Image
                src={template.preview}
                alt={template.name}
                width={400}
                height={192}
                className="mb-4 h-48 w-full rounded-md object-cover"
              />
              <h2 className="mb-2 text-2xl font-bold">{template.name}</h2>
              <p className="mb-4">{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{template.author}</div>
                <div className="text-sm font-bold text-blue-600">
                  {template.downloads} downloads
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <span className="mr-2 text-lg font-bold">
                  {template.rating.toFixed(1)}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`h-5 w-5 ${star <= template.rating ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <LiveCursors /> */}
    </div>
  );
}
