// Example types.ts or in a relevant file
export interface Country {
  id: string; // Or number, depending on your schema
  name: string;
  code: string;
  continent?: string; // Optional if it can be null
  population?: number; // Optional
  flagUrl?: string; // Optional
  // Add other fields you query for, e.g., gdp, createdAt
}