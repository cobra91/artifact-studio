"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { LiveCursors } from "../components/LiveCursors";
import { getTemplates } from "../lib/templates";
import { ArtifactTemplate } from "../types/artifact";

export default function Marketplace() {
  const [templates, setTemplates] = useState<ArtifactTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ArtifactTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchAndSetTemplates = async () => {
      const fetchedTemplates = await getTemplates();
      setTemplates(fetchedTemplates);
      setFilteredTemplates(fetchedTemplates);
    };
    fetchAndSetTemplates();
  }, []);

  useEffect(() => {
    let result = templates;
    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (category) {
      result = result.filter((t) => t.category === category);
    }
    setFilteredTemplates(result);
  }, [searchTerm, category, templates]);

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Component Marketplace</h1>
        <div className="flex mb-8">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full p-2 border rounded-l-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border-t border-b border-r rounded-r-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Image src={template.preview} alt={template.name} width={400} height={192} className="w-full h-48 object-cover mb-4 rounded-md" />
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
      <LiveCursors />
    </div>
  );
}
