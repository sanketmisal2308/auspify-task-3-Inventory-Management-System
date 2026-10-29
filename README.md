# Inventory Management System

## Project Overview
The Inventory Management System is a responsive web application developed to manage products, monitor stock levels, and generate inventory reports. It provides a dashboard for tracking product quantities and inventory value.

## Objectives
- Manage inventory records.
- Track stock quantities.
- Update stock levels accurately.
- Search and filter products.
- Identify low-stock and out-of-stock items.
- Generate inventory reports.
- Export inventory data to CSV.

## Technologies Used
- HTML5
- CSS3
- JavaScript
- Browser Local Storage

## Features
1. Dashboard with inventory statistics.
2. Add, edit, and delete products.
3. Product ID and duplicate validation.
4. Stock addition and removal.
5. Product search.
6. Category and stock-status filters.
7. Low-stock and out-of-stock indicators.
8. Inventory value calculation.
9. Category-wise inventory reports.
10. CSV report export.
11. Responsive user interface.

## Project Structure

```text
Inventory-Management-System/
├── index.html
├── style.css
├── script.js
├── README.md
└── screenshots/
```

## How to Run

1. Open the project folder in Visual Studio Code.
2. Ensure all three application files are in the same folder.
3. Install the Live Server extension if necessary.
4. Right-click `index.html`.
5. Select Open with Live Server.
6. The application will open in your browser.

## Data Storage

This version uses browser Local Storage to save inventory records. Data is stored in the browser and is not shared with other users or devices.

A server-side database is not included in this version.

## Testing Checklist

- Add a new product.
- Try adding a duplicate Product ID.
- Edit an existing product.
- Delete a product.
- Add stock to a product.
- Remove stock from a product.
- Try removing more stock than is available.
- Search by product name and ID.
- Filter by category and stock status.
- Verify dashboard totals.
- Export the inventory report as CSV.
- Refresh the browser and verify saved data.

## Screenshots

Save application screenshots in the `screenshots/` folder.

Suggested screenshots:
- Dashboard
- Product Inventory
- Add Product Form
- Stock Update
- Search and Filters
- Inventory Reports

## Internship Details

Organization: Auspify Technologies  
Program: Software Development Internship  
Task: Task 3 – Inventory Management System

## Future Improvements
- Integrate MySQL or another database.
- Develop backend APIs.
- Add login and user roles.
- Track stock movement history.
- Add supplier and purchase management.

## Author

Sanket Misal

## License

Developed for educational and internship purposes.