import { useCallback, useState } from 'react';
import { ListGroup, Modal, Button, Form } from "react-bootstrap";
import { TiDeleteOutline } from "react-icons/ti";
import { BiEditAlt } from "react-icons/bi";
import "./Channel.scss";


const Channel = ({ channel, selectedChannelId, selectChannel, deleteChannel, updateChannel }) => {

  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [channelName, setChannelName] = useState(channel.name);

  const handleClick = () => {
    selectChannel(channel.id);
  }

  const handleDelete = () => {
    deleteChannel(channel.id);
  }

  const openModal = () => {
    setShowEditChannelModal(true);
  }

  const closeModel = () => {
    setShowEditChannelModal(false);
  }

  const handleUpdate = useCallback(() => {
    updateChannel(channel.id, channelName);
    setShowEditChannelModal(false);
  }, [channel, channelName, updateChannel])

  const handleChannelNameChanges = e => {
    setChannelName(e.target.value);
  }

  return (
    <ListGroup.Item variant="secondary" key={channel.id} active={channel.id === selectedChannelId} className="channel" action onClick={handleClick} >
      <span>
        #{channel.name}
      </span>
      <span className="delete">
        <BiEditAlt size="1.5em" onClick={openModal}/>
        <TiDeleteOutline size="1.5em" onClick={handleDelete} />
      </span>
      <Modal show={showEditChannelModal} onHide={closeModel}>
        <Modal.Header closeButton>
          <Modal.Title>チャンネル名変更</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput5">
            <Form.Label>チャンネル名</Form.Label>
            <Form.Control type="text" value={channelName} onChange={handleChannelNameChanges} />
          </Form.Group></Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleUpdate}>
            更新
          </Button>
        </Modal.Footer>
      </Modal>
    </ListGroup.Item>
  );
}

export default Channel;