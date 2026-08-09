from pathlib import Path

path = Path("src/app/pages/inventario/inventario.page.scss")
data = path.read_bytes()
marker = b".inventory-summary"
index = data.find(marker)
if index == -1:
    raise SystemExit("marker not found")

insertion = b"\r\n  .dashboard-cards {\r\n" \
            b"    display: grid;\r\n" \
            b"    gap: 16px;\r\n" \
            b"    padding: 0 20px;\r\n" \
            b"    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n" \
            b"    margin-top: 16px;\r\n" \
            b"  }\r\n\r\n" \
            b"  .device-status-card,\r\n" \
            b"  .recent-activity-card {\r\n" \
            b"    background: #ffffff;\r\n" \
            b"    border-radius: 24px;\r\n" \
            b"    border: 1px solid #e0e3e5;\r\n" \
            b"    padding: 18px;\r\n" \
            b"    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);\r\n" \
            b"  }\r\n\r\n" \
            b"  .card-header-row {\r\n" \
            b"    display: flex;\r\n" \
            b"    align-items: center;\r\n" \
            b"    justify-content: space-between;\r\n" \
            b"    gap: 12px;\r\n" \
            b"    margin-bottom: 18px;\r\n" \
            b"  }\r\n\r\n" \
            b"  .card-header-row h2 {\r\n" \
            b"    margin: 0;\r\n" \
            b"    font-size: 17px;\r\n" \
            b"    color: #0f172a;\r\n" \
            b"  }\r\n\r\n" \
            b"  .status-pill,\r\n" \
            b"  .activity-note {\r\n" \
            b"    font-size: 12px;\r\n" \
            b"    font-weight: 700;\r\n" \
            b"    text-transform: uppercase;\r\n" \
            b"    letter-spacing: 0.04em;\r\n" \
            b"    padding: 7px 12px;\r\n" \
            b"    border-radius: 999px;\r\n" \
            b"  }\r\n\r\n" \
            b"  .status-pill.online {\r\n" \
            b"    background: rgba(56, 189, 248, 0.16);\r\n" \
            b"    color: #0ea5e9;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-note {\r\n" \
            b"    color: #64748b;\r\n" \
            b"    background: #f8fafc;\r\n" \
            b"  }\r\n\r\n" \
            b"  .device-status-list {\r\n" \
            b"    display: grid;\r\n" \
            b"    gap: 12px;\r\n" \
            b"    margin-bottom: 16px;\r\n" \
            b"  }\r\n\r\n" \
            b"  .device-status-item {\r\n" \
            b"    display: flex;\r\n" \
            b"    justify-content: space-between;\r\n" \
            b"    align-items: center;\r\n" \
            b"    padding: 14px 16px;\r\n" \
            b"    border-radius: 16px;\r\n" \
            b"    background: #f8fafc;\r\n" \
            b"  }\r\n\r\n" \
            b"  .device-status-item span {\r\n" \
            b"    font-size: 12px;\r\n" \
            b"    color: #64748b;\r\n" \
            b"  }\r\n\r\n" \
            b"  .device-status-item strong {\r\n" \
            b"    font-size: 14px;\r\n" \
            b"    color: #0f172a;\r\n" \
            b"  }\r\n\r\n" \
            b"  .device-status-footer {\r\n" \
            b"    display: flex;\r\n" \
            b"    justify-content: space-between;\r\n" \
            b"    gap: 12px;\r\n" \
            b"    padding: 12px 16px;\r\n" \
            b"    border-radius: 16px;\r\n" \
            b"    background: #f8fafc;\r\n" \
            b"    font-size: 13px;\r\n" \
            b"    color: #334155;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-list {\r\n" \
            b"    display: grid;\r\n" \
            b"    gap: 12px;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-item {\r\n" \
            b"    display: grid;\r\n" \
            b"    grid-template-columns: auto 1fr auto;\r\n" \
            b"    align-items: center;\r\n" \
            b"    gap: 12px;\r\n" \
            b"    padding: 14px 16px;\r\n" \
            b"    border-radius: 18px;\r\n" \
            b"    background: #f8fafc;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-icon {\r\n" \
            b"    width: 40px;\r\n" \
            b"    height: 40px;\r\n" \
            b"    display: grid;\r\n" \
            b"    place-items: center;\r\n" \
            b"    border-radius: 14px;\r\n" \
            b"    background: rgba(59, 130, 246, 0.12);\r\n" \
            b"    color: #2563eb;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-icon ion-icon {\r\n" \
            b"    font-size: 18px;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-content h3 {\r\n" \
            b"    margin: 0;\r\n" \
            b"    font-size: 14px;\r\n" \
            b"    color: #0f172a;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-content p {\r\n" \
            b"    margin: 4px 0 0;\r\n" \
            b"    font-size: 12px;\r\n" \
            b"    color: #64748b;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-time {\r\n" \
            b"    font-size: 12px;\r\n" \
            b"    color: #64748b;\r\n" \
            b"    text-align: right;\r\n" \
            b"    white-space: nowrap;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-item.activity-success .activity-icon {\r\n" \
            b"    background: rgba(16, 185, 129, 0.16);\r\n" \
            b"    color: #059669;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-item.activity-warning .activity-icon {\r\n" \
            b"    background: rgba(251, 191, 36, 0.16);\r\n" \
            b"    color: #ca8a04;\r\n" \
            b"  }\r\n\r\n" \
            b"  .activity-item.activity-primary .activity-icon {\r\n" \
            b"    background: rgba(59, 130, 246, 0.16);\r\n" \
            b"    color: #2563eb;\r\n" \
            b"  }\r\n\r\n" \
            b"  @media (max-width: 920px) {\r\n" \
            b"    .dashboard-cards {\r\n" \
            b"      grid-template-columns: 1fr;\r\n" \
            b"    }\r\n" \
            b"  }\r\n\r\n" \
            b"  @media (max-width: 640px) {\r\n" \
            b"    .dashboard-cards,\r\n" \
            b"    .total-products-card,\r\n" \
            b"    .summary-card,\r\n" \
            b"    .status-card,\r\n" \
            b"    .expiring-products,\r\n" \
            b"    .inventory-chart,\r\n" \
            b"    .recipes-section {\r\n" \
            b"      padding: 0 16px;\r\n" \
            b"    }\r\n\r\n" \
            b"    .device-status-card,\r\n" \
            b"    .recent-activity-card,\r\n" \
            b"    .status-card,\r\n" \
            b"    .summary-card,\r\n" \
            b"    .total-products-card,\r\n" \
            b"    .expiring-products,\r\n" \
            b"    .inventory-chart,\r\n" \
            b"    .recipes-section {\r\n" \
            b"      border-radius: 20px;\r\n" \
            b"    }\r\n" \
            b"  }\r\n"

path.write_bytes(data[:index] + insertion + data[index:])
print("inserted")
