import { ListGroup } from "react-bootstrap";


const Channel = ({ channel, selectedChannelId, selectChannel }) => {

  const handleClick = () => {
    selectChannel(channel.id);
  }

  return (
    <ListGroup.Item variant="secondary" key={channel.id} active={channel.id === selectedChannelId} action onClick={handleClick} >
      #{channel.name}
    </ListGroup.Item>
  );
}

export default Channel;