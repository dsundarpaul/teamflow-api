# Modules
[] Auth
[] Users
[] Tickets
[] Teams
[] .

# Module wise endpoints/service

[] Users
- [] Get all
- [] Create User
  - [] user user should be automatically created under a team if created by a admin, if super admin get team's ref
- [] Update User
  - [] user should not be able to update other unless superadmin or admin of the user's team
- [] Delete User
  - [] user should not be able to delete self
  - [] user should not be able to delete other unless superadmin or admin of the user's team

[] Tickets
- [] Get all, with filter based on team, author, status etc
  - [] only superadmin can see all team's tickets with team's filter
  - [] other team user/admin should not be able to fetch other team's tickets
  - [] search
  - [] pagination
- [] Create Ticket
- [] Update Ticket
- [] Delete Ticket

[] Team
- [] Team create
- [] Teams get all
- [] Team Update
- [] Team delete



# Tasks
- [] Add role in user (USER, ADMIN, SUPERADMIN)
  - [] update curd accordingly
- 
