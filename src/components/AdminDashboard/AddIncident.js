import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import axios from 'axios';

import Source from './Source';

const initialFormValues = {
  city: '',
  date: '',
  desc: '',
  empty_hand_hard: false,
  empty_hand_soft: false,
  less_lethal_methods: true,
  lethal_force: false,
  src: [],
  state: '',
  title: '',
  categories: [],
  uncategorized: false,
  verbalization: false,
};

const AddIncident = props => {
  // setting state for form management
  const [formValues, setFormValues] = useState(initialFormValues);
  const [amPmValue, setAmPmValue] = useState(false);
  const [address, setAddress] = useState('');
  const [srcValue, setSrcValue] = useState('');
  const [time, setTime] = useState('');

  //   setting state for all sources/categories added
  const [sources, setSources] = useState([]);

  // setting state for add incident pop up
  const [modalText, setModalText] = useState('');
  const [visible, setVisible] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { setAdding, getData, setPageNumber } = props;

  // gets latitude and longitude of given city/state
  const getLatAndLong = new Promise((resolve, reject) => {
    axios
      .get(
        `http://open.mapquestapi.com/geocoding/v1/address?key=${
          process.env.REACT_APP_MAPQUEST_API_KEY
        }&location=${address}${formValues.address ? ' ' : ''}${
          formValues.city
        }, ${formValues.state}`
      )
      .then(res => {
        const { lat, lng } = res.data.results[0].locations[0].latLng;
        resolve([lat, lng]);
      })
      .catch(err => {
        reject(err.message);
      });
  });

  // posts new incident to database
  const postIncident = newIncident => {
    axios
      .post(
        `${process.env.REACT_APP_BACKENDURL}/dashboard/incidents`,
        newIncident
      )
      .then(res => {
        console.log(res);
        setModalText('New incident added successfully');
        setTimeout(() => {
          // modal is unmounted, admin is redirected to first page of dashboard
          setVisible(false);
          setConfirmLoading(false);
          setAdding(false);
          setPageNumber(1);
          getData();
        }, 1500);
      })
      .catch(err => {
        setModalText('Something went wrong');
        setTimeout(() => {
          setVisible(false);
          setConfirmLoading(false);
          setAdding(false);
        }, 2000);
      });
  };

  // submitting form
  const handleOk = () => {
    // formatting date
    let newDateString;
    if (!formValues.date) {
      newDateString = new Date().toJSON();
    } else {
      const formattedDate = formatDate(formValues.date, amPmValue);
      const formattedTime = formatTime();
      newDateString = formattedDate + formattedTime;
    }
    // getting long and lat
    getLatAndLong
      .then(res => {
        const [lat, lng] = res;
        // creating updated/new incident object to be posted
        const newIncident = {
          ...formValues,
          lat,
          long: lng,
          date: newDateString,
          pending: false,
          rejected: false,
          src: sources,
        };
        postIncident(newIncident);
      })
      .catch(err => {
        setModalText('Something went wrong');
        setTimeout(() => {
          setVisible(false);
          setConfirmLoading(false);
          setAdding(false);
        }, 2000);
      });
  };

  // adding and removing sources
  const removeSrc = src => {
    const updatedSources = sources.filter(source => {
      return src !== source;
    });
    setSources(updatedSources);
  };

  const handleAddSrc = evt => {
    evt.preventDefault();
    if (sources.includes(srcValue)) {
      setSrcValue('');
      return;
    } else {
      setSources([...sources, srcValue]);
      setSrcValue('');
    }
  };

  //   form management functions
  const handleChange = evt => {
    const { name, value } = evt.target;
    if (name === 'src') {
      setSrcValue(value);
    } else if (name === 'time') {
      setTime(value);
    } else if (name === 'ampm') {
      setAmPmValue(value);
    } else if (name === 'address') {
      setAddress(value);
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  const handleSrcChange = evt => {
    setSrcValue(evt.target.value);
  };

  const handleCancel = () => {
    setVisible(false);
    setAdding(false);
  };

  //   formatting the date and time into date object
  const formatDate = date => {
    const [month, day, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatTime = () => {
    if (!time) {
      return 'T00:00:00.000Z';
    } else {
      let [hour, minute] = time.split(/\W/);

      if (hour.length === 1 && amPmValue === 'am') {
        hour = '0' + hour;
      }
      if (minute.length === 1) {
        minute = '0' + minute;
      }
      return `T${
        amPmValue === 'pm' ? Number(hour) + 12 + '' : hour
      }:${minute}:00.000Z`;
    }
  };

  //   clear the time input field/am-pm
  const handleTimeCancel = evt => {
    evt.preventDefault();
    setTime('');
    setAmPmValue(false);
  };

  return (
    <Modal
      title="Add a source"
      visible={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <form>
        <label className="add-incident-label" htmlFor="city">
          City
          <br />
          <input
            type="text"
            name="city"
            value={formValues.city}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="add-incident-label" htmlFor="state">
          State
          <br />
          <input
            type="text"
            name="state"
            value={formValues.state}
            onChange={handleChange}
          />
        </label>
        <br />
        <label htmlFor="address">
          Street Address
          <br />
          <input
            type="text"
            name="address"
            value={address}
            onChange={handleChange}
          />
        </label>
        <br />
        <label htmlFor="date">
          Date (Month/Day/Year)
          <br />
          <input
            type="text"
            name="date"
            value={formValues.date}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="add-incident-label" htmlFor="time">
          Time Relative to Location (XX:XX)
          <br />
          <input type="text" name="time" value={time} onChange={handleChange} />
          {time && (
            <>
              <br />
              <input
                type="radio"
                value="am"
                onChange={handleChange}
                name="ampm"
              />
              <label className="add-incident-label" htmlFor="ampm">
                A.M.
              </label>
              <input
                id="pm-input"
                type="radio"
                value="pm"
                onChange={handleChange}
                name="ampm"
              />
              <label className="add-incident-label" htmlFor="ampm">
                P.M.
              </label>
              <br />
              <button className="add-src" onClick={handleTimeCancel}>
                Cancel
              </button>
            </>
          )}
        </label>
        <br />
        <label className="add-incident-label" htmlFor="desc">
          Description
          <br />
          <input
            type="text"
            name="desc"
            value={formValues.desc}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="add-incident-label" htmlFor="title">
          Title for This Incident Report
          <br />
          <input
            type="text"
            name="title"
            value={formValues.title}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="add-incident-label" htmlFor="src">
          Link(s) to Media Source
          <br />
          <input
            type="text"
            name="src"
            value={srcValue}
            onChange={handleSrcChange}
          />
          <br />
          <button
            className="add-src"
            onClick={handleAddSrc}
            disabled={!srcValue}
          >
            Add Source
          </button>
          {sources.map(source => {
            return (
              <Source source={source} removeSrc={removeSrc} key={source} />
            );
          })}
        </label>
        <br />
      </form>
      {modalText ? modalText : ''}
    </Modal>
  );
};
export default AddIncident;
