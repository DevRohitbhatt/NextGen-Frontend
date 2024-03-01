import { useDrag } from 'react-dnd';
import * as Styled from "../pages/PrepChartTempStyles";


export function InventoryItem({Description,InventoryItemID,ThawTime }) {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "content",
        item: {InventoryItemID: InventoryItemID,id:InventoryItemID,},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))
    const handleDragEnd = () => {
        // Implement logic to handle the drag end event if needed
        console.log("Drag End");
    };
    return (
        <>
         <Styled.TableRow key={InventoryItemID} ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} onDragEnd={handleDragEnd}  >
            <Styled.TableCell> {InventoryItemID}</Styled.TableCell>
            <Styled.TableCell>{Description}</Styled.TableCell>
            <Styled.TableCell>{ThawTime}</Styled.TableCell>
         </Styled.TableRow>
        </>
    )
}


