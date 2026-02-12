import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import { FlatList, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSubject, getSubjects } from '../../api/subjects';
import { createSchedule, getSchedules } from '../../api/schedules';
import client from '../../api/client';
import useAuthStore from '../../store/authStore';

const ROOMS = ['Computer lab', 'Hybrid Lab', 'Classroom 101', 'Classroom 102'];
const SECTIONS = ['BSCS 1A', 'BSCS 2A', 'BSCS 3A', 'BSCS 4A'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


const HeaderDropdownMenu = ({ options, onSelect }) => {
  const navigation = useNavigation();
  const handleLogout = () => {
    setVisible(false);
    setTimeout(() => {
      alert("You have logged out!");
    }, 300);
    navigation.navigate("index");
  }
  const [visible, setVisible] = useState(false);
  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
  };
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>{visible ? "Menu ▲" : "Menu ▼"}</Text>
      </TouchableOpacity>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdownMenu}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed, hovered }) => [
                    styles.menuItem,
                    (pressed || hovered) && { backgroundColor: '#e0e0e0' }
                  ]}
                  onPress={() => {
                    if (item.value === "Logout") {
                      handleLogout();
                    } else {
                      handleSelect(item.value);
                      setVisible(false);
                    }
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={item.icon} size={20} color="black" style={{ marginRight: 10 }} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};




const ScheduleDetailModal = ({ visible, onClose, schedule }) => {
  if (!schedule) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.tableContainer}>
              <Text style={styles.detailLabel}>Subject Code: {schedule.subjectCode || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Subject Description: {schedule.subjectDescription || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Instructor: {schedule.instructor || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Room: {schedule.room || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Units: {schedule.units || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Schedule (Date & Time): {schedule.schedules ? schedule.schedules.join('; ') : 'N/A'}</Text>
              <Text style={styles.detailLabel}>Section: {schedule.section || 'N/A'}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const InstructorScheduleModal = ({ visible, onClose, instructorSchedules }) => {
  if (!visible || !instructorSchedules) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Instructor Schedules</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {instructorSchedules.map((schedule, index) => (
              <View key={index} style={styles.tableContainer}>
                <Text style={styles.detailLabel}>Subject Code: {schedule.subjectCode || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Subject Description: {schedule.subjectDescription || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Instructor: {schedule.instructor || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Room: {schedule.room || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Units: {schedule.units || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Schedule (Date & Time): {schedule.schedules ? schedule.schedules.join('; ') : 'N/A'}</Text>
                <Text style={styles.detailLabel}>Section: {schedule.section || 'N/A'}</Text>
                <View style={styles.separator} />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};



const ScheduleModal = ({ visible, onClose, onSave, initialData }) => {
  const [instructor, setInstructor] = useState(initialData?.instructor || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [room, setRoom] = useState(initialData?.room || '');

  const handleSave = () => {
    if (!instructor.trim() || !subject.trim() || !time.trim() || !room.trim()) {
      alert('Please fill in Instructor, Subject, Time, and Room.');
      return;
    }
    onSave({ instructor: instructor.trim(), subject: subject.trim(), time: time.trim(), room: room.trim() });
    setInstructor('');
    setSubject('');
    setTime('');
    setRoom('');
  };

  const handleClose = () => {
    setInstructor('');
    setSubject('');
    setTime('');
    setRoom('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{initialData ? 'Edit Entry' : 'Add Entry'}</Text>
          <TextInput
            placeholder="Instructor"
            value={instructor}
            onChangeText={setInstructor}
            style={styles.input}
          />
          <TextInput
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />
          <TextInput
            placeholder="Time"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />
          <TextInput
            placeholder="Room"
            value={room}
            onChangeText={setRoom}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InstructorsList = ({ instructors }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
      </View>
      {instructors.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No instructors available.</Text>
      ) : (
        instructors.map((instructor) => (
          <View key={instructor.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{instructor.name}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const AddInstructorModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter name.');
      return;
    }
    onSave(name.trim());
    setName('');
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Instructor</Text>
          <TextInput
            placeholder="Instructor Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddViewingModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    onSave(name.trim());
    setName('');
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Viewing</Text>
          <TextInput
            placeholder="Viewing Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const EditViewingModal = ({ visible, onClose, onSave, initialName }) => {
  const [name, setName] = useState(initialName || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    onSave(name.trim());
    setName('');
  };

  const handleClose = () => {
    setName(initialName || '');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Viewing</Text>
          <TextInput
            placeholder="Viewing Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};




const CreateScheduleForm = ({ onSave, existingSchedules = [], instructors: propsInstructors = [] }) => {
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [units, setUnits] = useState('');
  const [schedules, setSchedules] = useState([]);

  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [instructorModalVisible, setInstructorModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const days = DAYS;

  const parseTime = (timeStr) => {
    // Basic parser for "8am", "8:30am", "1pm", "13:00", "08:00"
    const lower = timeStr.toLowerCase().trim();
    const isPm = lower.includes('pm');
    const isAm = lower.includes('am');
    let time = lower.replace(/[a-z]/g, '').trim();
    let [hours, minutes] = time.split(':');

    if (!minutes) minutes = '00';

    let h = parseInt(hours, 10);
    if (isNaN(h)) return timeStr; // Return original if parsing fails

    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;

    return `${h.toString().padStart(2, '0')}:${minutes}`;
  };

  const parseScheduleString = (schedString) => {
    const [dayPart, timePart] = schedString.split(', ');
    const [start, end] = timePart.split('-');
    const dayMap = {
      'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu',
      'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
    };
    return {
      day: dayMap[dayPart],
      start_time: parseTime(start),
      end_time: parseTime(end)
    };
  };

  const [section, setSection] = useState('');
  const [room, setRoom] = useState('');

  const handleCreateSubject = async () => {
    if (!newSubjectCode.trim() || !newSubjectDescription.trim() || !units.trim()) {
      Alert.alert('Error', 'Please fill in subject fields (Code, Description, Units).');
      return;
    }

    try {
      const newSubject = {
        subject_code: newSubjectCode.trim(),
        subject_description: newSubjectDescription.trim(),
        units: parseInt(units),
      };

      await createSubject(newSubject);
      setSubjectCode(newSubject.subject_code);
      setSubjectDescription(newSubject.subject_description);
      setNewSubjectCode('');
      setNewSubjectDescription('');
      // Keep units set as it might be useful, or clear it? Better to clear or keep synced?
      // actually units state is shared.
      setSubjectModalVisible(false);
      Alert.alert('Success', 'Subject created successfully!');
    } catch (error) {
      let errorMessage = 'Failed to create subject';
      if (error && error.detail) {
        errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const addSchedule = () => {
    if (!selectedDay || !startTime || !endTime) {
      alert('Please select day, start time, and end time.');
      return;
    }
    const newSchedule = `${selectedDay}, ${startTime}-${endTime}`;
    setSchedules([...schedules, newSchedule]);
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
    setScheduleModalVisible(false);
  };

  const removeSchedule = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!subjectCode.trim() || !instructor || !units || schedules.length === 0 || !room.trim() || !section.trim()) {
      alert('Please fill in all fields (Subject, Instructor, Units, Room, Section) and add at least one schedule.');
      return;
    }

    try {
      const selectedInstructorObj = propsInstructors.find(i => i.name === instructor);
      if (!selectedInstructorObj) {
        alert('Selected instructor not found.');
        return;
      }

      const promises = schedules.map(schedStr => {
        const parsed = parseScheduleString(schedStr);
        const payload = {
          subject_code: subjectCode.trim(),
          instructor_id: selectedInstructorObj.id,
          day: parsed.day,
          start_time: parsed.start_time,
          end_time: parsed.end_time,
          room: room.trim(),
          section: section.trim(),
        };
        return createSchedule(payload);
      });

      await Promise.all(promises);
      Alert.alert('Success', 'Schedule(s) created successfully!');

      if (onSave) onSave();

      setSubjectCode('');
      setInstructor('');
      setUnits('');
      setSchedules([]);
    } catch (error) {
      console.error("Save schedule error:", error);
      let errorMessage = 'Failed to save schedule.';
      if (error && error.detail) {
        errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      Alert.alert('Error', errorMessage);
    }

  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Schedule</Text>

      <TouchableOpacity style={styles.dropdown} onPress={() => setSubjectModalVisible(true)}>
        <Text style={styles.dropdownText}>{subjectCode || 'Create Subject & Code'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dropdown} onPress={() => setInstructorModalVisible(true)}>
        <Text style={styles.dropdownText}>{instructor || 'Select Instructor'}</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Subject Description"
        value={subjectDescription}
        editable={false}
        style={[styles.input, { backgroundColor: '#f0f0f0', color: '#555' }]} // Visual indication it's read-only
      />

      <TextInput
        placeholder="Units"
        value={units}
        onChangeText={setUnits}
        keyboardType="numeric"
        style={styles.input}
        editable={false}
      />
      <TextInput
        placeholder="Room (e.g., 301)"
        value={room}
        onChangeText={setRoom}
        style={styles.input}
      />
      <TextInput
        placeholder="Section (e.g., A)"
        value={section}
        onChangeText={setSection}
        style={styles.input}
      />

      <Text style={styles.label}>Schedules:</Text>
      {schedules.map((sched, index) => (
        <View key={index} style={styles.scheduleItem}>
          <Text style={styles.scheduleText}>{sched}</Text>
          <TouchableOpacity style={styles.removeScheduleButton} onPress={() => removeSchedule(index)}>
            <Text style={styles.removeScheduleText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addScheduleButton} onPress={() => setScheduleModalVisible(true)}>
        <Text style={styles.addScheduleText}>+ Add Schedule Date/Time</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Schedule</Text>
      </TouchableOpacity>

      {/* Subject Modal */}
      <Modal visible={subjectModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Subject & Code</Text>
            <TextInput
              placeholder="Subject Code (e.g., CC101)"
              value={newSubjectCode}
              onChangeText={setNewSubjectCode}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newSubjectDescription}
              onChangeText={setNewSubjectDescription}
              style={styles.input}
            />
            <TextInput
              placeholder="Units"
              value={units}
              onChangeText={setUnits}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateSubject}>
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#aaa' }]} onPress={() => setSubjectModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Instructor Modal */}
      <Modal visible={instructorModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Instructor</Text>
            {propsInstructors && propsInstructors.length > 0 ? (
              <FlatList
                data={propsInstructors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setInstructor(item.name); setInstructorModalVisible(false); }}>
                    <Text style={styles.menuItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={{ padding: 20, textAlign: 'center' }}>No instructors found for your department.</Text>
            )}
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#aaa' }]} onPress={() => setInstructorModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Schedule Modal */}
      <Modal visible={scheduleModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Schedule</Text>
            <Text style={styles.label}>Select Day:</Text>
            <View style={{ maxHeight: 200 }}>
              <FlatList
                data={days}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.menuItem} onPress={() => setSelectedDay(item)}>
                    <Text style={[styles.menuItemText, selectedDay === item && { color: 'blue' }]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <TextInput
              placeholder="Start Time (e.g., 8:00am)"
              value={startTime}
              onChangeText={setStartTime}
              style={styles.input}
            />
            <TextInput
              placeholder="End Time (e.g., 9:00am)"
              value={endTime}
              onChangeText={setEndTime}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addSchedule}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#aaa' }]}
                onPress={() => {
                  setSelectedDay('');
                  setStartTime('');
                  setEndTime('');
                  setScheduleModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const DropdownExample = () => {
  const user = useAuthStore((state) => state.user);
  const [headerSelection, setHeaderSelection] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [instructorsError, setInstructorsError] = useState(null);
  const [viewingAll, setViewingAll] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState(null);
  const [viewingInstructors, setViewingInstructors] = useState(false);
  const [addInstructorModalVisible, setAddInstructorModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); const [expandedInstructor, setExpandedInstructor] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [instructorScheduleModalVisible, setInstructorScheduleModalVisible] = useState(false);
  const [selectedInstructorSchedules, setSelectedInstructorSchedules] = useState([]);
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [addViewingModalVisible, setAddViewingModalVisible] = useState(false);
  const [editingViewing, setEditingViewing] = useState(null);
  const [viewingButtons, setViewingButtons] = useState([]);
  const [instructorsByViewing, setInstructorsByViewing] = useState({});


  const headerOptions = [
    { label: 'Create Schedule', value: 'Create Schedule', icon: 'create-outline' },
    { label: 'Schedule List', value: 'Schedule List', icon: 'list-outline' },
    { label: 'Logout', value: 'Logout', icon: 'log-out-outline' },
  ];

  const showSchedule = headerSelection === 'Create Schedule';
  const showCourseSchedule = headerSelection === 'Schedule List';


  const fetchSchedules = async () => {
    if (!user) return; // Removed department check as field was deleted from backend
    setLoadingSchedule(true);
    try {
      const [schedulesData, subjectsData] = await Promise.all([
        getSchedules(),
        getSubjects()
      ]);

      // Create a map for quick subject lookup
      const subjectMap = {};
      if (subjectsData) {
        subjectsData.forEach(sub => {
          subjectMap[sub.subject_code] = sub;
        });
      }

      // Map backend fields to frontend local state format
      const mapped = schedulesData.map(s => {
        // Find instructor name from instructors list if available
        const inst = instructors.find(i => i.id === s.instructor_id);
        const subject = subjectMap[s.subject_code];
        const dayMap = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };

        return {
          ...s,
          subjectCode: s.subject_code,
          subjectDescription: subject ? subject.subject_description : 'N/A',
          instructor: inst ? inst.name : s.instructor_id,
          schedule: `${dayMap[s.day] || s.day}, ${s.start_time}-${s.end_time}`,
          units: subject ? subject.units.toString() : (s.units || 'N/A')
        };
      });
      setSchedule(mapped);
    } catch (e) {
      console.log("Failed to fetch schedules (likely due to legacy data mismatch):", e);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchInstructors = async () => {
    if (!user || !user.department) return;
    setLoadingInstructors(true);
    try {
      // Fetch all users in the chairperson's department
      const response = await client.get(`/users/department/${user.department}`);
      // Filter strictly for instructors (ignore other roles like admin or chairperson)
      const instructorList = response.data.filter(u => u.role === 'instructor');

      const mapped = instructorList.map(inst => ({
        id: inst.user_id,
        name: `${inst.firstname} ${inst.middlename ? inst.middlename + ' ' : ''}${inst.lastname}`.trim()
      }));
      setInstructors(mapped);
      setInstructorsError(null);
    } catch (e) {
      console.error("Failed to fetch instructors:", e);
      setInstructorsError("Failed to load instructors.");
      // Fallback or empty list is already set by default state
    } finally {
      setLoadingInstructors(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    if (showCourseSchedule || showSchedule) {
      fetchSchedules();
    }
  }, [showCourseSchedule, showSchedule, instructors, user]); // Refresh when switching or instructors/user loaded

  useEffect(() => {
    if (showSchedule) {
      // Logic for create schedule will need instructors. 
      // If we are reverting, maybe it uses a different source?
      // For now, maintain local state.
    }
  }, [showSchedule]);

  const handleRemoveInstructor = (id) => {
    setInstructorsByViewing(prev => ({
      ...prev,
      [selectedViewing]: prev[selectedViewing]?.filter(inst => inst.id !== id) || [],
    }));
  };
  const handleAddInstructor = (name) => {
    const currentInstructors = instructorsByViewing[selectedViewing] || [];
    const newId = currentInstructors.length > 0 ? (Math.max(...currentInstructors.map(inst => parseInt(inst.id))) + 1).toString() : '1';
    setInstructorsByViewing(prev => ({
      ...prev,
      [selectedViewing]: [...(prev[selectedViewing] || []), { id: newId, name }],
    }));
    setAddInstructorModalVisible(false);
  };

  const handleRemoveViewing = (id) => {
    setViewingButtons(viewingButtons.filter(btn => btn.id !== id));
  };

  const handleAddViewing = (name) => {
    const nextId = viewingButtons.length > 0 ? (Math.max(...viewingButtons.map(btn => parseInt(btn.id))) + 1).toString() : '1';
    setViewingButtons([...viewingButtons, { id: nextId, name }]);
    setAddViewingModalVisible(false);
  };

  const handleEditViewing = (id, name) => {
    setViewingButtons(viewingButtons.map(btn => btn.id === id ? { ...btn, name } : btn));
    setEditingViewing(null);
  };


  const openAddModal = () => {
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setModalVisible(true);
  };

  const handleSaveEntry = (entry) => {
    if (editingIndex !== null) {
      const newSchedule = [...schedule];
      newSchedule[editingIndex] = entry;
      setSchedule(newSchedule);
    } else {
      setSchedule([...schedule, entry]);
    }
    setModalVisible(false);
  };

  const handleDeleteEntry = (index) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = (entry) => {
    setSchedule([...schedule, entry]);
  };



  const groupedSchedules = schedule.reduce((acc, s) => {
    if (!acc[s.instructor]) acc[s.instructor] = [];
    acc[s.instructor].push(s);
    return acc;
  }, {});

  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg',
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <HeaderDropdownMenu options={headerOptions} onSelect={setHeaderSelection} />
          {user?.department && (
            <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 5 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{user.department} Department</Text>
            </View>
          )}
        </View>
        {headerSelection && (
          <Text style={styles.selectedText}>Selected Menu: {headerSelection}</Text>
        )}

        {showSchedule && (
          <CreateScheduleForm
            onSave={() => {
              setHeaderSelection('Schedule List'); // Switch to list view after save
            }}
            instructors={instructors}
          />
        )}

        {showCourseSchedule && (
          <>
            <Text style={styles.scheduleTitle}>Schedule List</Text>
            {viewingInstructor ? (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setViewingInstructor(null)}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.instructorTitle}>{viewingInstructor}'s Schedules</Text>
                <ScrollView horizontal>
                  <View style={styles.tableContainer}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, styles.headerCell, { width: 100, flex: 0 }]}>Subject Code</Text>
                      <Text style={[styles.tableCell, styles.headerCell, { width: 200, flex: 0 }]}>Subject Description</Text>
                      <Text style={[styles.tableCell, styles.headerCell, { width: 100, flex: 0 }]}>Room</Text>
                      <Text style={[styles.tableCell, styles.headerCell, { width: 60, flex: 0 }]}>Units</Text>
                      <Text style={[styles.tableCell, styles.headerCell, { width: 200, flex: 0 }]}>Schedule (Date & Time)</Text>
                      <Text style={[styles.tableCell, styles.headerCell, { width: 80, flex: 0 }]}>Section</Text>
                    </View>
                    {schedule.filter(s => s.instructor === viewingInstructor).map((item, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: 100, flex: 0 }]}>{item.subjectCode}</Text>
                        <Text style={[styles.tableCell, { width: 200, flex: 0 }]}>{item.subjectDescription}</Text>
                        <Text style={[styles.tableCell, { width: 100, flex: 0 }]}>{item.room}</Text>
                        <Text style={[styles.tableCell, { width: 60, flex: 0 }]}>{item.units}</Text>
                        <Text style={[styles.tableCell, { width: 200, flex: 0 }]}>{item.schedule}</Text>
                        <Text style={[styles.tableCell, { width: 80, flex: 0 }]}>{item.section}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : (
              instructors.map((inst) => (
                <TouchableOpacity
                  key={inst.id}
                  style={styles.instructorButton}
                  onPress={() => setViewingInstructor(inst.name)}
                >
                  <Text style={styles.instructorButtonText}>{inst.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}






        <ScheduleModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveEntry}
          initialData={editingIndex !== null ? schedule[editingIndex] : null}
        />

        <AddViewingModal
          visible={addViewingModalVisible}
          onClose={() => setAddViewingModalVisible(false)}
          onSave={handleAddViewing}
        />

        {
          editingViewing && (
            <EditViewingModal
              visible={!!editingViewing}
              onClose={() => setEditingViewing(null)}
              onSave={(name) => handleEditViewing(editingViewing.id, name)}
              initialName={editingViewing.name}
            />
          )
        }

        <AddInstructorModal
          visible={addInstructorModalVisible}
          onClose={() => {
            setAddInstructorModalVisible(false);
          }}
          onSave={handleAddInstructor}
        />

      </View >
    </ImageBackground >
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 0,
    flex: 1,
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(119, 119, 118, 0.5)',
  },
  headerContainer: {
    marginBottom: 10,
  },
  headerButton: {
    marginTop: 15,
    backgroundColor: '#070707ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuItem: {
    padding: 15,
    borderBottomColor: '#000000ff',
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 10,
    color: 'black',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    minWidth: 300,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    backgroundColor: '#070707ff',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryButton: {
    backgroundColor: '#ffffffff',
    padding: 10,
    borderWidth: 5,
    borderRadius: 10,
    marginVertical: 10,
    alignText: 'left',
  },
  categoryButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructorButton: {
    backgroundColor: 'white',
    padding: 10,
    borderWidth: 5,
    borderRadius: 10,
    marginVertical: 10,
    alignText: 'left',
  },
  instructorButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },

  viewingButton: {
    backgroundColor: '#070707ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignText: 'center',
  },
  viewingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#070707ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  viewingButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: 'darkgreen',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  editButtonText: {
    color: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  scheduleText: {
    fontSize: 16,
    flex: 1,
  },
  removeScheduleButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  removeScheduleText: {
    color: 'white',
  },
  addScheduleButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 3,
    marginBottom: 15,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  addScheduleText: {
    color: 'white',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  removeButtonText: {
    color: 'white',
  },

  instructorTitle: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 5,
    alignSelf: 'flex-start',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  actionButton: {
    backgroundColor: '#070707ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  actionText: {
    color: 'white',
  },
  addButton: {
    marginTop: 15,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#165aedff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  roomListContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  roomListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  roomButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  roomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  courseScheduleTableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
  },
});

export default DropdownExample;
