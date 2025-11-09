---
trigger: always_on
---

# Project introduction

Greenmatch is a A hyperlocal climate-action micro-jobs marketplace connecting government officials (Gram Panchayat/local bodies) with community members in rural/climate-vulnerable regions to complete climate-resilience tasks for verified compensation.

This is Greenmatch functions project. The purpose of this project is to provide Supabase Edge functions that can be used by the client app and these functions should essentially mimic the backend that we don't really have when using supabase. All business logic stays here and all sub queries required to get something will be bundled here. We want to follow best practices of developing these edge functions with each endpoint following proper OpenAPI secifications and documentation.

# Tech stack:
Language/Framework: Typescript
Architecture: Controllers & Edge functions

# Important notes:
- These functions should support multipart requests and store files on supabase storage.
- These functions should have a way to subscribe to chat feature.
- Use supabase migration new <name> to create new migrations - IMPORTANT! *This should be followed Strictly!*
- All the markdown files that you generate after completion of a task should be placed under "docs" directory at root of the project. Any files outside of that is STRICTLY UNACCEPTABLE!