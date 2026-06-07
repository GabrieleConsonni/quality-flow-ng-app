/**
 * Catalog of all known step kinds (CommandCodes) supported by the BE _EXECUTOR_MAPPING.
 * Source of truth: quality-flow/app/elaborations/services/operations/command_executor_composite.py
 *                  quality-flow/app/elaborations/models/dtos/configuration_command_dto.py
 *
 * Categories:
 *   Producers  – commands that produce / fetch values into the execution scope
 *   Consumers  – commands that cause side-effects (write/drop/clean)
 *   Assertions – assert commands on JSON data
 *   Control    – flow-control commands (timing, scope cleanup)
 */

export type StepKindCategory = 'Producers' | 'Consumers' | 'Assertions' | 'Control';

export interface StepKindMeta {
  /** BE CommandCode value, matches SuiteItemCommand.command_code */
  readonly code: string;
  /** Human-readable label shown in the step picker */
  readonly label: string;
  readonly category: StepKindCategory;
  readonly description: string;
  /** Extra keywords for full-text search in the step picker */
  readonly searchableTerms: string[];
}

export const STEP_KIND_CATALOG: readonly StepKindMeta[] = [
  // ── Producers ──────────────────────────────────────────────────────────────
  {
    code: 'setVariable',
    label: 'Set variable',
    category: 'Producers',
    description: 'Store a static or computed value into the execution scope.',
    searchableTerms: ['variable', 'constant', 'init', 'scope', 'value'],
  },
  {
    code: 'receiveQueue',
    label: 'Receive from queue',
    category: 'Producers',
    description: 'Consume messages from an SQS queue and store the result.',
    searchableTerms: ['queue', 'sqs', 'receive', 'message', 'consume'],
  },
  {
    code: 'queryDatabase',
    label: 'Query database',
    category: 'Producers',
    description: 'Run a SQL query and store the result into scope.',
    searchableTerms: ['database', 'db', 'sql', 'query', 'select'],
  },
  {
    code: 'readApi',
    label: 'Read HTTP API',
    category: 'Producers',
    description: 'Perform a GET request and store the response body.',
    searchableTerms: ['http', 'api', 'get', 'rest', 'read', 'fetch'],
  },
  {
    code: 'writeApi',
    label: 'Write HTTP API',
    category: 'Producers',
    description: 'Perform a POST/PUT/PATCH/DELETE request and optionally store the response.',
    searchableTerms: ['http', 'api', 'post', 'put', 'patch', 'delete', 'rest', 'write'],
  },

  // ── Consumers ──────────────────────────────────────────────────────────────
  {
    code: 'sendMessageQueue',
    label: 'Send message to queue',
    category: 'Consumers',
    description: 'Publish a message to an SQS queue.',
    searchableTerms: ['queue', 'sqs', 'send', 'publish', 'message'],
  },
  {
    code: 'saveTable',
    label: 'Save table',
    category: 'Consumers',
    description: 'Persist a runtime value into a local internal database table.',
    searchableTerms: ['table', 'internal', 'database', 'save', 'insert'],
  },
  {
    code: 'exportDataset',
    label: 'Export dataset',
    category: 'Consumers',
    description: 'Write a runtime value into an external database / dataset.',
    searchableTerms: ['dataset', 'external', 'export', 'database', 'write'],
  },
  {
    code: 'dropTable',
    label: 'Drop table',
    category: 'Consumers',
    description: 'Drop an internal database table entirely.',
    searchableTerms: ['table', 'drop', 'delete', 'remove'],
  },
  {
    code: 'cleanTable',
    label: 'Clean table',
    category: 'Consumers',
    description: 'Truncate all rows from an internal database table.',
    searchableTerms: ['table', 'clean', 'truncate', 'clear'],
  },
  {
    code: 'dropDataset',
    label: 'Drop dataset',
    category: 'Consumers',
    description: 'Drop an external dataset entirely.',
    searchableTerms: ['dataset', 'drop', 'delete', 'remove', 'external'],
  },
  {
    code: 'cleanDataset',
    label: 'Clean dataset',
    category: 'Consumers',
    description: 'Truncate all rows in an external dataset.',
    searchableTerms: ['dataset', 'clean', 'truncate', 'clear', 'external'],
  },
  {
    code: 'runSuite',
    label: 'Run suite',
    category: 'Consumers',
    description: 'Trigger execution of another test suite.',
    searchableTerms: ['suite', 'run', 'execute', 'nested'],
  },

  // ── Assertions ─────────────────────────────────────────────────────────────
  {
    code: 'jsonEquals',
    label: 'Assert: equals',
    category: 'Assertions',
    description: 'Assert that a JSON value equals the expected value.',
    searchableTerms: ['assert', 'json', 'equals', 'compare'],
  },
  {
    code: 'jsonNotEmpty',
    label: 'Assert: not empty',
    category: 'Assertions',
    description: 'Assert that a JSON value is not null / empty.',
    searchableTerms: ['assert', 'json', 'not empty', 'exists'],
  },
  {
    code: 'jsonEmpty',
    label: 'Assert: empty',
    category: 'Assertions',
    description: 'Assert that a JSON value is null or empty.',
    searchableTerms: ['assert', 'json', 'empty', 'null'],
  },
  {
    code: 'jsonContains',
    label: 'Assert: contains',
    category: 'Assertions',
    description: 'Assert that a JSON object contains certain key-value pairs.',
    searchableTerms: ['assert', 'json', 'contains', 'partial', 'subset'],
  },
  {
    code: 'jsonArrayEquals',
    label: 'Assert: array equals',
    category: 'Assertions',
    description: 'Assert that a JSON array equals the expected array (key-based comparison).',
    searchableTerms: ['assert', 'json', 'array', 'equals', 'list'],
  },
  {
    code: 'jsonArrayNotEmpty',
    label: 'Assert: array not empty',
    category: 'Assertions',
    description: 'Assert that a JSON array is not empty.',
    searchableTerms: ['assert', 'json', 'array', 'not empty'],
  },
  {
    code: 'jsonArrayEmpty',
    label: 'Assert: array empty',
    category: 'Assertions',
    description: 'Assert that a JSON array is empty.',
    searchableTerms: ['assert', 'json', 'array', 'empty'],
  },
  {
    code: 'jsonArrayContains',
    label: 'Assert: array contains',
    category: 'Assertions',
    description: 'Assert that a JSON array contains certain elements (key-based).',
    searchableTerms: ['assert', 'json', 'array', 'contains', 'subset', 'list'],
  },

  // ── Control ────────────────────────────────────────────────────────────────
  {
    code: 'sleep',
    label: 'Wait',
    category: 'Control',
    description: 'Pause execution for a given number of milliseconds.',
    searchableTerms: ['sleep', 'wait', 'delay', 'pause', 'ms'],
  },
  {
    code: 'deleteVariable',
    label: 'Delete variable',
    category: 'Control',
    description: 'Remove a previously set runtime variable from scope.',
    searchableTerms: ['delete', 'variable', 'remove', 'scope', 'constant'],
  },
] as const;
