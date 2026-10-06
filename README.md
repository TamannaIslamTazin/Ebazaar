# Ebazaar – Bangladesh Online Marketplace

Ebazaar is a Bangladesh-focused online marketplace prototype with separate **merchant** and **customer** workflows. It demonstrates product discovery, ordering, shop management, ratings, order fulfillment, and basic sales analytics using a browser-based frontend.

## Live Demo

https://tamannaislamtazin.github.io/Ebazaar/

## GitHub Repository

https://github.com/TamannaIslamTazin/Ebazaar

## Login

Users log in using a **phone number and password**.

### Demo Accounts

| Role | Phone | Password |
|---|---|---|
| Merchant | 01711111111 | pass123 |
| Merchant | 01822222222 | pass123 |
| Merchant | 01933333333 | pass123 |
| Customer | 01644444444 | pass123 |
| Customer | 01555555555 | pass123 |

> These credentials are for demonstration purposes only.

## Key Features

### Merchant

- Merchant/customer role selection from the first screen
- Demo ৳100 activation flow
- One-month shop unlock
- Shop setup and management
- Product creation with photos
- Incoming order management
- Customer information visible with orders
- Mark orders as supplied
- Sales table
- Profit tracking
- Sales graph and analytics

### Customer

- Customer profile with name, phone number, address, and area
- Product search
- Product images
- Results from multiple shops
- Shop results ordered using rating and location-related logic
- Place orders
- Track marketplace interactions
- Rate shops

### Shared Marketplace Workflow

- Customer orders appear in the relevant merchant workflow
- Demo shops, products, and product images are included
- Browser-based persistence keeps demo data available between page refreshes

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js
- Browser LocalStorage
- Git
- GitHub
- GitHub Pages

## How to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/TamannaIslamTazin/Ebazaar.git
```

2. Open the project folder:

```bash
cd Ebazaar
```

3. Open `index.html` in Chrome, Firefox, or Edge.

No backend server is required because the application stores its demo data in the browser using LocalStorage.

## Reset Demo Data

To reset the application data:

1. Open browser Developer Tools.
2. Go to **Application**.
3. Open **Local Storage**.
4. Delete the `ebazaar_v1` entry.
5. Refresh the page.

## Project Purpose

Ebazaar was created to demonstrate a practical e-commerce workflow for a Bangladesh-focused marketplace while exploring:

- Customer and merchant user flows
- Product and order management
- Browser-based state management
- Local data persistence
- Ratings and order tracking
- Sales and profit visualization
- Frontend marketplace design

## Limitations

This project is a **frontend prototype**, not a production e-commerce system.

- Data is stored in Browser LocalStorage.
- There is no production backend.
- There is no external database.
- The authentication flow is intended for demonstration only.
- Demo credentials are publicly visible.
- The project should not be used for real customer, payment, or sensitive data.

## Future Improvements

Possible future improvements include:

- Backend API integration
- Database integration
- Secure authentication and authorization
- Password hashing
- Payment gateway integration
- Inventory management
- Improved merchant analytics
- Advanced search and filtering
- Responsive/mobile UI improvements
- Cloud deployment

## Author

**Tamanna Islam Tazin**

- GitHub: https://github.com/TamannaIslamTazin
- LinkedIn: https://www.linkedin.com/in/tamanna-islam-tazin-771574441

## License

This project is intended for educational and portfolio purposes.
