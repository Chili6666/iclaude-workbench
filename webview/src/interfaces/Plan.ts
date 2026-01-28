export interface Plan {
  id: string;           // Filename without .md extension
  title: string;        // From first H1 heading or filename
  content: string;      // Full markdown content
  filePath: string;     // Absolute path
  modifiedAt: number;   // Timestamp for sorting
}
