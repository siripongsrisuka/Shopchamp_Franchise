import React from "react";
import { useTranslation } from 'react-i18next';
import { Radio, RadioGroup } from 'rsuite';

function PeriodControl({ period, handleChange }) {
    const { t } = useTranslation();

    return <RadioGroup
            name="radio-group-inline-picker"
            inline
            appearance="picker"
            value={period} // Set the current value from state
            onChange={handleChange} // Update state on change
        >
            <Radio  value="day"  >{t('summary.daily')}</Radio>
            <Radio  value="week">{t('summary.weekly')}</Radio>
            <Radio  value="month">{t('summary.monthly')}</Radio>
        </RadioGroup>
};


export default PeriodControl;
