'use client';

import { Button } from '@/components/ui/button';

const categories = [
  { id: 'all', label: 'All Photos' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'sports', label: 'Sports & Games' },
  { id: 'events', label: 'Events' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'graduation', label: 'Graduation' },
];

type Props = {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
};

export function GalleryFilters({ activeCategory, onCategoryChange }: Props) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            size="sm"
            type="button"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
