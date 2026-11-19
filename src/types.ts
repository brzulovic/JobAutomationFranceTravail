export type AutomationId = 
  | 'candidatures-envoyees' 
  | 'candidatures-gmail' 
  | 'france-travail-liste' 
  | 'france-travail-recherche' 
  | 'pipeline-croise';

export type OutputMode = 'playwright' | 'console' | 'curl' | 'python' | 'prompt';

export interface AutomationParameter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'date' | 'number';
  defaultValue: string | boolean | number;
  options?: { label: string; value: string }[];
  description: string;
}

export interface AutomationDefinition {
  id: AutomationId;
  title: string;
  subtitle: string;
  category: 'Extraction' | 'Email Parsing' | 'France Travail' | 'Pipeline Cross-Check';
  icon: string;
  description: string;
  targetUrls: string[];
  parameters: AutomationParameter[];
  pitfalls: { problem: string; solution: string }[];
  steps: string[];
}
