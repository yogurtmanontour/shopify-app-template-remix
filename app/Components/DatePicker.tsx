import { Popover, TextField, Icon, Card, DatePicker, BlockStack, Checkbox } from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function CustomDatePicker({Label,selectedDate,setSelectedDate, DateSelected, SetDateSelected} : {Label:string,selectedDate:Date,setSelectedDate:Dispatch<SetStateAction<Date>>,DateSelected:boolean,SetDateSelected:Dispatch<SetStateAction<boolean>>}){
    const [visible, setVisible] = useState(false);
    const [{ month, year }, setDate] = useState({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
    });
    const formattedValue = DateSelected ? selectedDate.toLocaleDateString(): null;
    function handleInputValueChange() {
        console.log("handleInputValueChange");
    }
    function handleOnClose({ relatedTarget }: any) {
        setVisible(false);
    }
    function handleMonthChange(month: any, year: any) {
        setDate({ month, year });
    }
    function handleDateSelection({ end: newSelectedDate } : any) {
        setSelectedDate(newSelectedDate);
        SetDateSelected(true)
        setVisible(false);
    }
    useEffect(() => {
        if (selectedDate) {
            setDate({
            month: selectedDate.getMonth(),
            year: selectedDate.getFullYear(),
            });
        }
    }, [selectedDate]);


    return(
        <BlockStack>
            <Popover
                active={visible}
                autofocusTarget="none"
                preferredAlignment="left"
                fullWidth
                preferInputActivator={false}
                preferredPosition="below"
                preventCloseOnChildOverlayClick
                onClose={handleOnClose}
                activator={
                    <TextField
                    role="combobox"
                    label={Label}
                    prefix={<Icon source={CalendarIcon} />}
                    value={formattedValue || ""}
                    onFocus={() => setVisible(true)}
                    onChange={handleInputValueChange}
                    autoComplete="off"
                    disabled={!DateSelected}
                    />
                    }
                >
                    <Card>
                        <DatePicker
                        month={month}
                        year={year}
                        selected={selectedDate}
                        onMonthChange={handleMonthChange}
                        onChange={handleDateSelection}
                        />
                    </Card>
            </Popover>
            <Checkbox 
                label="Select Date"
                checked={DateSelected}
                onChange={()=>{
                    SetDateSelected(!DateSelected)
                }}
            />
        </BlockStack>
    )
}