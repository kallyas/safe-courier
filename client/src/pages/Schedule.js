import { useState, useRef } from 'react'
import { Col, Row, Form, Modal, Button, InputGroup } from "@themesberg/react-bootstrap";
import Datetime from "react-datetime";
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import interactionPlugin from "@fullcalendar/interaction";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";


const SwalWithBootstrapButtons = withReactContent(Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-primary me-3',
      cancelButton: 'btn btn-gray'
    },
    buttonsStyling: false
  }));

  const EventModal = (props) => {
    const [title, setTitle] = useState(props.title);
    const [start, setStart] = useState(props.start);
    const [end, setEnd] = useState(props.end);
  
    const { show = false, edit = false, id } = props;
    const startDate = start ? moment(start).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
    const endDate = end ? moment(end).endOf("day").format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
  
    const onTitleChange = (e) => setTitle(e.target.value);
  
    const onConfirm = () => {
      const finalStart = moment(startDate).toDate();
      const finalEnd = moment(endDate).toDate();
      const payload = { id, title, start: finalStart, end: finalEnd };
  
      if (edit) {
        return props.onUpdate && props.onUpdate(payload);
      }
  
      return props.onAdd && props.onAdd(payload);
    }
    const onDelete = () => edit && props.onDelete && props.onDelete(id);
    const onHide = () => props.onHide && props.onHide();
  
    return (
      <Modal as={Modal.Dialog} centered show={show} onHide={onHide}>
        <Form className="modal-content">
          <Modal.Body>
            <Form.Group id="title" className="mb-4">
              <Form.Label>Event title</Form.Label>
              <Form.Control
                required
                autoFocus
                type="text"
                value={title}
                onChange={onTitleChange} />
            </Form.Group>
            <Row>
              <Col xs={12} lg={6}>
                <Form.Group id="startDate">
                  <Form.Label>Select start date</Form.Label>
                  <Datetime
                    timeFormat={false}
                    onChange={setStart}
                    renderInput={(props, openCalendar) => (
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </InputGroup.Text>
                        <Form.Control
                          required
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={startDate}
                          onFocus={openCalendar}
                          onChange={() => { }} />
                      </InputGroup>
                    )} />
                </Form.Group>
              </Col>
              <Col xs={12} lg={6}>
                <Form.Group id="endDate" className="mb-2">
                  <Form.Label>Select end date</Form.Label>
                  <Datetime
                    timeFormat={false}
                    onChange={setEnd}
                    isValidDate={currDate => currDate.isAfter(start)}
                    renderInput={(props, openCalendar) => (
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </InputGroup.Text>
                        <Form.Control
                          required
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={endDate}
                          onFocus={openCalendar}
                          onChange={() => { }} />
                      </InputGroup>
                    )} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" className="me-2" onClick={onConfirm}>
              {edit ? "Update event" : "Add new event"}
            </Button>
  
            {edit ? (
              <Button variant="danger" onClick={onDelete}>
                Delete event
              </Button>
            ) : null}
  
            <Button variant="link" className="text-gray ms-auto" onClick={onHide}>
              Close
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  };

  const Calendar = () => {
    const defaultModalProps = { id: "", title: "", start: null, end: null };
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalProps, setModalProps] = useState(defaultModalProps);
    const [events, setEvents] = useState([]);
  
    const calendarRef = useRef();
    const currentDate = moment().format("YYYY-MM-DD");
  
    const onDateClick = (props) => {
      const { date } = props;
      const id = events.length + 1;
      const endDate = new Date(date).setDate(date.getDate() + 1);
  
      setModalProps({ ...modalProps, id, start: date, end: endDate });
      setShowAddModal(true);
    };
  
    const onEventClick = (props) => {
      const { event: { id, title, start, end } } = props;
      setModalProps({ id, title, start, end });
      setShowEditModal(true);
    };
  
    const onEventUpdate = (props) => {
      const { id, title, start, end } = props;
      const calendarApi = calendarRef.current.getApi();
      const calendarElem = calendarApi.getEventById(id);
  
      if (calendarElem) {
        calendarElem.setProp("title", title);
        calendarElem.setStart(start);
        calendarElem.setEnd(end);
      }
  
      setShowEditModal(false);
    };
  
    const onEventAdd = (props) => {
      const newEvent = { ...props, dragable: true, className: 'bg-blue text-white', allDay: true };
  
      setShowAddModal(false);
      setEvents([...events, newEvent]);
      setModalProps(defaultModalProps);
    };
  
    const onEventDelete = async function(id) {
      const result = await SwalWithBootstrapButtons.fire({
        icon: 'error',
        title: 'Confirm deletion',
        text: 'Are you sure you want to delete this event?',
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: 'No, cancel!'
      });
  
      setShowEditModal(false);
      setModalProps(defaultModalProps);
  
      if (result.isConfirmed) {
        await SwalWithBootstrapButtons.fire('Deleted!', 'The event has been deleted.', 'success');
  
        const newEvents = events.filter(e => e.id !== parseInt(id));
        setEvents(newEvents);
      }
    };
  
    const handleClose = () => {
      setShowAddModal(false);
      setShowEditModal(false);
    };
  
    return <>
      {showEditModal ? (
        <EventModal
          {...modalProps}
          edit={true}
          show={showEditModal}
          onUpdate={onEventUpdate}
          onDelete={onEventDelete}
          onHide={handleClose}
        />
      ) : null}
  
      {showAddModal ? (
        <EventModal
          {...modalProps}
          show={showAddModal}
          onAdd={onEventAdd}
          onHide={handleClose}
        />
      ) : null}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-flex">
            <h3>Schedule a parcel delivery</h3>
        </div>
      </div>
      <FullCalendar
        editable
        selectable
        events={events}
        ref={calendarRef}
        themeSystem="bootstrap"
        initialView="dayGridMonth"
        displayEventTime={false}
        initialDate={currentDate}
        dateClick={onDateClick}
        eventClick={onEventClick}
        plugins={[dayGridPlugin, timeGridPlugin, bootstrapPlugin, interactionPlugin]}
      />
    </>;
  };
  
export default Calendar;