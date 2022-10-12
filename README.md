## About DNC Server
Generic DNC is a logical data Server, designed to provide location based data measurement by provide customized tag mapping on top og general database where sensor data is organized based on device IDs. This is acheieved by adding customized tags to the selected location and generate query based on the customzied tags.

## Release History

- v1.3.1 has the following changes:
  - Adding of additional information in invitation Email content


- v1.3.0 has the following changes:
  - Removal of OTP option for new User Signup
  - Adding of sending invitation link for new User Signup through Admin account

- v1.2.0 has the following changes:
  - Update Login response
  - New endpoint for getting field tags of a client
  - New endpoint for getting device list with Tags
  - New endpoint for getting device map

- v1.1.0 has the following changes:
  - DNC DB auto initialization

- v1.0.1 has the following changes:
  - Fix [#4](https://gitlab-x.mcci.com/client/milkweed/mcgraw/dnc/dnc-server/-/issues/4): Response updated based on the user requests.
  - Fix [#2](https://gitlab-x.mcci.com/client/milkweed/mcgraw/dnc/dnc-server/-/issues/2): Issue fixed.

- v1.0.0 Initial release:
  - User Management
  - Cleint Management
  - Register Device
  - Configure Device
