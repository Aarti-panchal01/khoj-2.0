# Bugfix Requirements Document

## Introduction

The CustomSelect component used for university selection in Login.jsx and Signup.jsx displays "No options available" on real mobile devices, preventing users from selecting their university. The same code works correctly on desktop browsers and mobile emulators (Chrome DevTools), but fails on actual mobile devices. This prevents mobile users from completing the signup/login flow.

Additionally, Dayananda Sagar Institutions (DSI) is configured with 4 campuses (DSU, DSCE, DSATM, DSIT) in the database but should only have 3 campuses (DSU, DSCE, DSATM). DSIT should be removed.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user opens the university dropdown (CustomSelect) on a real mobile device (iOS or Android) THEN the system displays "No options available" even though the universities array should contain 5 universities

1.2 WHEN a user opens the university dropdown on a real mobile device THEN the system fails to render the university options that were successfully loaded from the API

1.3 WHEN the universities data is queried from the database THEN the system returns Dayananda Sagar Institutions with 4 campuses (DSU, DSCE, DSATM, DSIT) instead of the correct 3 campuses

### Expected Behavior (Correct)

2.1 WHEN a user opens the university dropdown on a real mobile device THEN the system SHALL display all 5 universities (Dayananda Sagar Institutions, PES University, RV College of Engineering, REVA University, UVCE) in the dropdown list

2.2 WHEN a user opens the university dropdown on a real mobile device THEN the system SHALL render the options with the same styling and functionality as desktop browsers

2.3 WHEN the universities data is queried from the database THEN the system SHALL return Dayananda Sagar Institutions with exactly 3 campuses (DSU, DSCE, DSATM) without DSIT

2.4 WHEN a user selects "Dayananda Sagar Institutions" on any device THEN the system SHALL display a campus dropdown with exactly 3 options (DSU, DSCE, DSATM)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user opens the university dropdown on desktop/laptop browsers THEN the system SHALL CONTINUE TO display all universities correctly

3.2 WHEN a user opens the university dropdown in mobile emulators (Chrome DevTools) THEN the system SHALL CONTINUE TO display all universities correctly

3.3 WHEN a user selects "PES University" on any device THEN the system SHALL CONTINUE TO display a campus dropdown with 3 options (Electronic City Campus, Ring Road Campus, Hanumanth Nagar Campus)

3.4 WHEN a user selects a university with a single campus (RV College of Engineering, REVA University, UVCE) THEN the system SHALL CONTINUE TO auto-select the campus and not display a campus dropdown

3.5 WHEN the API endpoint /api/universities is called THEN the system SHALL CONTINUE TO return the complete list of universities with their campuses in the correct format

3.6 WHEN a user completes the signup/login form with valid university and campus selections THEN the system SHALL CONTINUE TO process the form submission successfully
