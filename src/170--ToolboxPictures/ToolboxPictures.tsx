import { useParams } from "react-router-dom";


const ToolboxPictures = () => {


const { toolboxId } = useParams();



  return (
    <div>
      here will be the pictures for toolbox {toolboxId}

    </div>
  )
}

export default ToolboxPictures
