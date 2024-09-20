# Comprehensive Regression Test Candidate Analysis Criteria

## Introduction

This document outlines the criteria and process for identifying regression test candidates from a set of existing test cases. Regression testing is crucial for ensuring that new code changes or feature additions do not negatively impact existing functionality. The goal of this analysis is to create a subset of test cases that can be run regularly to catch potential regressions quickly and efficiently.

## Goals

1. Identify test cases that cover critical system functionality
2. Ensure broad coverage across different components and integrations
3. Focus on areas that are prone to breakage or have high business impact
4. Create a manageable set of regression tests that can be run frequently

## Test Case Information Available

Our analysis is based on the following information for each test case:

- ID and Key
- Name
- Folder (category/module)
- Associated issues (if any)
- Test steps

Note: We do not have access to historical data on bug frequency or recent code changes.

## Requirements for Regression Test Candidates

1. Coverage of core functionality
2. High business impact
3. Integration points
4. Complexity of the test case
5. Security-sensitive operations

## Acceptance Criteria

A test case is considered a good regression candidate if it meets at least three of the following criteria:

1. Tests a critical business process
2. Covers multiple integrated components
3. Verifies a functionality that appears complex or prone to errors
4. Checks a process involving calculations or data manipulation
5. Validates security-related functions
6. Involves multiple user roles or permissions

## Analysis Process

For each test case:

1. Review the test case name and steps
2. Assess against the acceptance criteria
3. Analyze the test script for complexity and coverage
4. Assign a regression candidate score (1-5, with 5 being highest priority)
5. Provide a brief justification for the score
6. Output the analysis only as a json artifact.
   1. id
   2. key
   3. name
   4. score
   5. justification

## Regression Candidate Score Guide

- 5: Critical regression candidate, meets 5+ criteria
- 4: High priority regression candidate, meets 4 criteria
- 3: Medium priority regression candidate, meets 3 criteria
- 2: Low priority regression candidate, meets 2 criteria
- 1: Not recommended for regression, meets 0-1 criteria

## Tips for Analysis

- Look for keywords in test names and steps that indicate critical processes, such as "verify," "validate," "critical," "security," etc.
- Consider the potential business impact if the functionality being tested were to fail
- When dealing with user permissions, testing users with single permissions is considered a higher priority than those with grouped permissions, to ascertain restrictions are working
- Pay attention to test cases that involve multiple steps or interactions between different system components
- Prioritize test cases that cover fundamental features used across the system

## Limitations and Considerations

- This analysis is based on the information available in the test case descriptions and steps. It does not take into account historical bug data or recent code changes.
- The effectiveness of the selected regression suite should be periodically reviewed and adjusted based on actual defect detection and system changes.
- This process should be complemented by other testing strategies, such as unit testing, integration testing, and exploratory testing.

## Example Analysis

Test Case: UNO-T3 "Verifying Neuven User with only Manage invoice permission"
Score: 4
Justification: This test case verifies core functionality (manage invoice permissions), has security implications, tests a critical business process (invoice management), and covers multiple components (login, navigation, permissions).

## Next Steps

After completing the analysis:

1. Review the highest-scoring test cases to ensure they provide good coverage
2. Consider automating the selected regression test cases where possible
3. Establish a regular cadence for running the regression test suite
4. Periodically review and update the regression test suite based on new features and discovered issues
