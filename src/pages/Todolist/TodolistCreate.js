import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, FlatList, ScrollView } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ko';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import VirtualizedView from '../../utils/VirutalizedList';

const COLORS = ['#06A4FD', '#97E5FF', '#FF0000', '#FF81EB', '#FF8E25', '#FFE871', '#70FF4D', '#35F2DC', '#48B704', '#8206FD'];

const TodolistCreate = ({ route, navigation }) => {
  const { selectedDate: initialSelectedDate } = route.params;
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [todoList, setTodoList] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [checklistItem, setChecklistItem] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(token)
        const response = await axios.get('http://10.0.2.2:8080/list', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTodoList(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTodos();
  }, []);     

  const handleSave = async () => {
    if (title.trim() === '' || text.trim() === '') {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post('http://10.0.2.2:8080/list', {
        userid: user.userid,
        title: title,
        text: text,
        color: color,
        examDate: selectedDate,
        checklist: checklist,
      },{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        Alert.alert('성공', '일정 추가 성공');
        console.log(response.data)
        const todoId = response.data
        await saveChecklistItems(todoId);
        navigation.navigate('MainPage');
      } else {
        Alert.alert('Error', 'Failed to add todo');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while adding the todo');
    }
  };

  const handleAddChecklistItem = () => {
    setIsAddingChecklist(true);
  };

  const handleSaveChecklistItem = () => {
    if (checklistItem.trim() !== '') {
      const newChecklistItem = { text: checklistItem, completed: false };
      setChecklist([...checklist, newChecklistItem]);
      setChecklistItem('');
      setIsAddingChecklist(false);
    }
  };

  const saveChecklistItems = async (todoId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      for (const item of checklist) {
        const response = await axios.post('http://10.0.2.2:8080/checklist', {
          userid: user.userid,
          color: color,
          examDate: selectedDate,
          list: item.text,
          completed: item.completed,
          todoId: todoId
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (response.status !== 201) {
          Alert.alert('Error', 'Failed to add checklist item');
          return;
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while adding the checklist item');
    }
  };

  const handleToggleChecklistItem = (index) => {
    const newChecklist = [...checklist];
    newChecklist[index].completed = !newChecklist[index].completed;
    setChecklist(newChecklist);
  };

  const markedDates = {};
  todoList.forEach(item => {
    const dateKey = moment(item.examDate).format('YYYY-MM-DD');
    if (!markedDates[dateKey]) {
        markedDates[dateKey] = { dots: [] };
    }
    markedDates[dateKey].dots.push({
        key: item.id,
        color: item.color || 'red',
        selectedDotColor: item.color || 'red',
    });
});

  markedDates[selectedDate] = { selected: true, selectedColor: 'blue' };

  return (
    <VirtualizedView>
      <View style={styles.container}>
        <Calendar
          style={styles.calendar}
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markingType={'multi-dot'}
          markedDates={markedDates}
          monthFormat={'yyyy년 MM월'}
        />
        <View style={styles.colorPicker}>
          {COLORS.map((c, index) => (
            <TouchableOpacity key={index} onPress={() => setColor(c)} style={[styles.colorCircle, { backgroundColor: c, borderColor: color === c ? 'black' : 'transparent' }]} />
          ))}
        </View>
        <View style={styles.eventDetail}>
          <View style={[styles.circle, { backgroundColor: color }]} />
          <Text style={styles.eventDate}>
            {moment(selectedDate).locale('ko').format('YYYY년 M월 D일')}
            <Text style={styles.checklistCount}> ({checklist.length})</Text>
          </Text>
          <Text style={styles.text1}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.text1}>상세내용</Text> 
          <TextInput
            style={styles.input}
            placeholder="상세내용을 입력하세요"
            value={text}
            onChangeText={setText}
            multiline
          />
          <View style={styles.checklistContainer}>
            <Text style={styles.text2}>Check List</Text>
            <TouchableOpacity style={styles.addButton1} onPress={handleAddChecklistItem}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {isAddingChecklist && (
            <View style={styles.addChecklistContainer}>
              <TextInput
                style={styles.input}
                placeholder="체크리스트 항목 입력"
                value={checklistItem}
                onChangeText={setChecklistItem}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveChecklistItem}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={checklist}
            renderItem={({ item, index }) => (
              <View style={styles.checklistItemContainer}>
                <Text style={[styles.checklistItem, item.completed && styles.checklistItemCompleted]}>{item.text}</Text>
                <CheckBox
                  value={item.completed}
                  onValueChange={() => handleToggleChecklistItem(index)}
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        <View style={styles.style1}>
          <Text style={styles.text3}>일정추가하기</Text>
          <TouchableOpacity style={styles.addButton2} onPress={handleSave}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </VirtualizedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  calendar: {
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  eventDetail: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    marginBottom: 16,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  checklistCount: {
    fontSize: 14,
    color: 'gray',
  },
  text1: {
    color: '#C8C8C8',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#C8C8C8',
    borderBottomWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  checklistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addChecklistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  checklistItem: {
    fontSize: 16,
  },
  checklistItemCompleted: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  text2: {
    color: '#06A4FD',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 10,
  },
  addButton1: {
    backgroundColor: '#06A4FD',
    // padding: 10,
    height: 25,
    width: 25,
    borderRadius: 3,
    alignItems: 'center',
  },
  text3: {
    color: '#06A4FD',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 10,
  },
  style1:{
    flexDirection:'row',
    alignItems:"center",
    justifyContent:"center"
  },
  addButton2: {
  backgroundColor: '#06A4FD',
  // padding: 5,
  width: 25,
  height: 25,
  borderRadius: 20,
  alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#06A4FD',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default TodolistCreate;