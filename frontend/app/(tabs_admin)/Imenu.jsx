import { useNavigation } from "@react-navigation/native";
import { useState } from 'react';
import { FlatList, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const RoomList = ({ rooms, onSelectRoom }) => {
  return (
    <View style={styles.roomListContainer}>
      <Text style={styles.roomListTitle}>Select a Room</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomButton} onPress={() => onSelectRoom(item)}>
            <Text style={styles.roomButtonText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const RoomWeeklySchedule = ({ room, schedules, onBack }) => {
  // Group schedules by day
  const groupedSchedules = schedules.reduce((acc, entry) => {
    const day = entry.schedule.split(' ')[0]; // Assuming format "Day Time"
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.weeklyScheduleContainer}>
      <View style={styles.scheduleHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.scheduleTitle}>{room} Schedule</Text>
      </View>
      <ScrollView>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day}</Text>
            {groupedSchedules[day] ? (
              groupedSchedules[day].map((entry, idx) => (
                <View key={idx} style={styles.scheduleItem}>
                  <Text style={styles.scheduleText}>
                    {entry.subjectDescription} - {entry.schedule.split(' ').slice(1).join(' ')} - Section: {entry.section}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noScheduleText}>No classes</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const AccountModal = ({ visible, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (newPassword.trim() === '') {
      alert('Please enter a new password.');
      return;
    }
    // Here you can implement actual password change logic
    alert('Password changed successfully!');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleCancel = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleCancel}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TermsModal = ({ visible, onClose }) => {
  const termsOfUseContent = `Step-by-Step Guide to Using the App:

1. Open the app and log in with your credentials.
2. Use the Menu dropdown to select options like My Schedule, Room Schedule, or Account Setting.
3. In My Schedule, view your personal schedule entries.
4. In Room Schedule, check schedules by room.
5. In Account Setting, manage your account, view terms, or privacy policy.
6. To add or edit schedules, use the Scheduler option if available.
7. Logout when done to secure your account.
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Use</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>{termsOfUseContent}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const PrivacyModal = ({ visible, onClose }) => {
  const privacyContent = ` This app collects minimal personal information necessary for functionality, such as login credentials and schedule data. We do not share your data with third parties without consent. Your data is stored securely and used only for app purposes. For more details, contact support.
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>{privacyContent}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ProfileModal = ({ visible, onClose, personalDetails }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personal Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.profileDetails}>
              <Text style={styles.detailText}>Name: {personalDetails.name}</Text>
              <Text style={styles.detailText}>Email: {personalDetails.email}</Text>
              <Text style={styles.detailText}>Phone: {personalDetails.phone}</Text>
              <Text style={styles.detailText}>Address: {personalDetails.address}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const DropdownExample = () => {
  const [headerSelection, setHeaderSelection] = useState(null);
  const [schedule, setSchedule] = useState([
    { subjectCode: 'SE 101', subjectDescription: 'Software Engineering l', units: 1.00, schedule: 'Mon 8:00 AM - 9:00 AM', room: 'Computer Lab', section: 'BSCS 3A' },
    { subjectCode: 'CC 105', subjectDescription: 'Information Management', units: 1.00, schedule: 'Tue 9:00 AM - 10:00 AM', room: 'Computer Lab', section: 'BSCS 3A' },
    { subjectCode: 'CS 201', subjectDescription: 'Data Structures', units: 1.00, schedule: 'Wed 10:00 AM - 11:00 AM', room: 'Computer Lab', section: 'BSCS 3A' },
    { subjectCode: 'IT 301', subjectDescription: 'Network Security', units: 1.00, schedule: 'Thu 1:00 PM - 2:00 PM', room: 'Hybrid Lab', section: 'BSCS 3A' },
    { subjectCode: 'SE 102', subjectDescription: 'Software Engineering ll', units: 1.00, schedule: 'Fri 2:00 PM - 3:00 PM', room: 'Hybrid Lab', section: 'BSCS 3A' },
    { subjectCode: 'CSE 2', subjectDescription: 'CS Elective ll', units: 1.00, schedule: 'Fri 3:00 PM - 4:00 PM', room: 'Hybrid Lab', section: 'BSCS 3A' },
    { subjectCode: 'NC 101', subjectDescription: 'Network and Communication', units: 3.00, schedule: 'Tue 11:00 AM - 2:00 PM', room: 'Computer Lab', section: 'BSCS 3A' },
    { subjectCode: 'CSE 2', subjectDescription: 'CS Elective ll', units: 3.00, schedule: 'Sat 1:00 PM - 4:00 PM', room: 'Hybrid Lab', section: 'BSCS 3A' },
  ]);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [personalDetails, setPersonalDetails] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, City, Country',
  });

  const headerOptions = [
    { label: 'My Schedule', value: 'My Schedule' },
    { label: 'Room Schedule', value: 'Room Schedule' },
    { label: 'Account Setting', value: 'Account Setting' },
    { label: 'Logout', value: 'Logout' },
  ];

  const showCourseSchedule = headerSelection === 'My Schedule';
  const showRoomSchedule = headerSelection === 'Room Schedule';
  const showAccountSetting = headerSelection === 'Account Setting';

  // Get unique rooms
  const uniqueRooms = [...new Set(schedule.map(item => item.room))];

  // Filter schedules for selected room
  const roomSchedules = selectedRoom ? schedule.filter(item => item.room === selectedRoom) : [];

  const handleAccountButton = () => {
    setAccountModalVisible(true);
  };

  const handleTermsOfUse = () => {
    setTermsModalVisible(true);
  };

  const handlePrivacy = () => {
    setPrivacyModalVisible(true);
  };

  const handleProfile = () => {
    setProfileModalVisible(true);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToRoomList = () => {
    setSelectedRoom(null);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg', // Replace with your actual background image URL
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.container}>
        <HeaderDropdownMenu options={headerOptions} onSelect={setHeaderSelection} />
        {headerSelection && (
          <Text style={styles.selectedText}>Selected Menu: {headerSelection}</Text>
        )}

        {showCourseSchedule && (
          <>
            <Text style={styles.scheduleTitle}>My Schedule</Text>
            {schedule.length === 0 ? (
              <Text style={{ padding: 10, fontStyle: 'italic', color: 'white' }}>
                No subjects added in Scheduler.
              </Text>
            ) : (
              <ScrollView>
                <View style={styles.courseScheduleTableContainer}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.headerCell]}>Subject Code</Text>
                    <Text style={[styles.tableCell, styles.headerCell]}>Subject Description</Text>
                    <Text style={[styles.tableCell, styles.headerCell]}>Units</Text>
                    <Text style={[styles.tableCell, styles.headerCell]}>Schedule</Text>
                    <Text style={[styles.tableCell, styles.headerCell]}>Room</Text>
                    <Text style={[styles.tableCell, styles.headerCell]}>Section</Text>
                  </View>
                  {schedule.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.subjectCode}</Text>
                      <Text style={styles.tableCell}>{item.subjectDescription}</Text>
                      <Text style={styles.tableCell}>{item.units}</Text>
                      <Text style={styles.tableCell}>{item.schedule}</Text>
                      <Text style={styles.tableCell}>{item.room}</Text>
                      <Text style={styles.tableCell}>{item.section}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </>
        )}

        {showRoomSchedule && (
          <>
            <Text style={styles.scheduleTitle}>Room Schedule</Text>
            {schedule.length === 0 ? (
              <Text style={{ padding: 10, fontStyle: 'italic', color: 'white' }}>
                No schedule entries.
              </Text>
            ) : selectedRoom ? (
              <RoomWeeklySchedule room={selectedRoom} schedules={roomSchedules} onBack={handleBackToRoomList} />
            ) : (
              <RoomList rooms={uniqueRooms} onSelectRoom={handleSelectRoom} />
            )}
          </>
        )}

        {showAccountSetting && (
          <>
            <Text style={styles.scheduleTitle}>Account Setting</Text>
            <View style={styles.accountButtons}>
              <TouchableOpacity style={styles.accountButton} onPress={handleAccountButton}>
                <Text style={styles.accountButtonText}>Changes Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButton} onPress={handleTermsOfUse}>
                <Text style={styles.accountButtonText}>Terms of Use</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButton} onPress={handlePrivacy}>
                <Text style={styles.accountButtonText}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButton} onPress={handleProfile}>
                <Text style={styles.accountButtonText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <AccountModal
          visible={accountModalVisible}
          onClose={() => setAccountModalVisible(false)}
        />
        <TermsModal
          visible={termsModalVisible}
          onClose={() => setTermsModalVisible(false)}
        />
        <PrivacyModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
        />
        <ProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          personalDetails={personalDetails}
        />
      </View>
    </ImageBackground>
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
    alignItems: 'flex-start',
  },
  headerButton: {
    marginTop: 15,
    backgroundColor: '#070707ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    width: 'auto',
    alignItems: 'center',
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
    minWidth: 400,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#ccc',
  },
  tableHeader: {
    backgroundColor: '#070707ff',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    textAlign: 'center',
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  courseScheduleTableContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    width: '100%',
  },
  accountButtons: {
    flexDirection: 'column',
    marginVertical: 20,
  },
  accountButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  accountButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentView: {
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 400,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingRight: 10,
    paddingBottom: 20,
    alignitems: 'center',
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  PrivacyModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  profileDetails: {
    padding: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
  },
  contentScroll: {
    padding: 10,
    maxHeight: 300,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
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
    fontSize: 16,
  },
  roomListContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  roomListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roomButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  roomButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weeklyScheduleContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    maxHeight: 400,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'rigth',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 20,
    backgroundColor: '#070707ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignbackbutton: 'left',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scheduleItem: {
    paddingLeft: 10,
    marginBottom: 3,
  },
  scheduleText: {
    fontSize: 16,
  },
  noScheduleText: {
    fontStyle: 'italic',
    color: '#666',
    paddingLeft: 10,
  },
});

export default DropdownExample;
