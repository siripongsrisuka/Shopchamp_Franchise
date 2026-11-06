// DEV-0002 ชิ้น UI กลางของเว็บ Shopchamp (ยกจากเว็บพี่น้อง) · คลาส .sc-* อยู่ที่ src/styles/theme.css
// ❌ component ในไฟล์นี้ไม่คำนวณอะไร รับค่าที่จอคำนวณมาแล้วเท่านั้น
import React, { useMemo } from "react";

// การ์ดตัวเลข · tone: 'danger' | 'success' | 'warning' | 'info' | 'purple'
export function ScMetricCard({ label, value, unit, sub, icon = "bi bi-graph-up", tone = "info", testId }) {
  const iconStyle = useMemo(() => ({ background: `var(--sc-${tone}-bg)`, color: `var(--sc-${tone})` }), [tone]);
  return (
    <div className="sc-card" data-testid={testId}>
      <div className="sc-metric">
        <div>
          <div className="lab">{label}</div>
          <div className="val">
            {value}{unit ? <small>{unit}</small> : null}
          </div>
          {sub ? <div className="sub">{sub}</div> : null}
        </div>
        <div className="ic" style={iconStyle}>
          <i className={icon} />
        </div>
      </div>
    </div>
  );
}

export default ScMetricCard;
