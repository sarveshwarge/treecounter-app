import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { cameraSolid, imageGallery, forward } from '../../../assets';
import styles from '../../../styles/competition/competition-form.native';
import { formatDateToMySQL } from './../../../helpers/utils';
import { formatDate } from './../../../utils/utils';
import DateTimePicker from 'react-native-modal-datetime-picker';
import i18n from '../../../locales/i18n';
import { Formik } from 'formik';
import { TextField } from 'react-native-material-textfield';
import competitionFormSchema from './../../../server/formSchemas/competition';
import { generateFormikSchemaFromFormSchema } from '../../../helpers/utils';
import ImagePicker from 'react-native-image-crop-picker';
import buttonStyles from '../../../styles/common/button.native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Dropdown } from 'react-native-material-dropdown';

const validationSchema = generateFormikSchemaFromFormSchema(
  competitionFormSchema
);

export const FormikForm = props => {
  const buttonType = props.buttonType;
  return (
    <Formik
      initialValues={props.initialValues}
      onSubmit={values => {
        let imageFileData = 'data:image/jpeg;base64,' + values.imageFile.data;
        let newValues = {
          ...values
        };
        newValues.imageFile = imageFileData;
        props.onCreateCompetition(newValues);
        console.log(newValues);
      }}
      validationSchema={validationSchema}
    >
      {props => (
        <>
          <View style={styles.view_container}>
            <KeyboardAwareScrollView
              contentContainerStyle={styles.formScrollView}
              enableOnAndroid
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="always"
              resetScrollToCoords={{ x: 0, y: 0 }}
              scrollEnabled
            >
              <Text style={styles.add_competition_title}>Add Competition</Text>
              <View>
                <TextField
                  label={i18n.t('label.competition_name')}
                  value={props.values.name}
                  tintColor={'#89b53a'}
                  titleFontSize={12}
                  returnKeyType="next"
                  lineWidth={1}
                  blurOnSubmit={false}
                  error={props.touched.name && props.errors.name}
                  onChangeText={props.handleChange('name')}
                  onBlur={props.handleBlur('name')}
                />
              </View>

              <AccessPicker
                values={props.values}
                touched={props.touched}
                errors={props.errors}
                handleChange={props.handleChange}
              />

              <View style={styles.formView}>
                <View style={styles.formHalfTextField}>
                  <TextField
                    label={i18n.t('label.competition_goal')}
                    value={props.values.goal}
                    tintColor={'#89b53a'}
                    titleFontSize={12}
                    returnKeyType="next"
                    lineWidth={1}
                    blurOnSubmit={false}
                    keyboardType="numeric"
                    error={props.touched.goal && props.errors.goal}
                    onChangeText={props.handleChange('goal')}
                    onBlur={props.handleBlur('goal')}
                  />
                </View>

                <CompetitionDatePicker
                  endDate={props.values.endDate}
                  setFieldValue={props.setFieldValue}
                  touched={props.touched.endDate}
                  errors={props.errors.endDate}
                />
              </View>
              <View>
                <TextField
                  label={i18n.t('label.competition_description')}
                  value={props.values.description}
                  tintColor={'#89b53a'}
                  titleFontSize={12}
                  returnKeyType="next"
                  lineWidth={1}
                  blurOnSubmit={false}
                  multiline
                  error={props.touched.description && props.errors.description}
                  onChangeText={props.handleChange('description')}
                  onBlur={props.handleBlur('description')}
                />
              </View>

              <AddImage
                image={props.values.imageFile}
                setFieldValue={props.setFieldValue}
              />
            </KeyboardAwareScrollView>

            {buttonType === 'competition' ? (
              <TouchableOpacity
                style={buttonStyles.actionButtonTouchable}
                onPress={props.handleSubmit}
              >
                <View style={buttonStyles.actionButtonView}>
                  <Text style={buttonStyles.actionButtonText}>
                    {i18n.t('label.create_competition')}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {buttonType === '>' ? (
              <TouchableOpacity
                style={buttonStyles.actionButtonSmallTouchable}
                onPress={props.handleSubmit}
              >
                <Image
                  source={forward}
                  resizeMode="cover"
                  style={buttonStyles.actionButtonSmallImage}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      )}
    </Formik>
  );
};

export function AccessPicker(props) {
  let data = [
    {
      label: i18n.t('label.competition_access_immediate'),
      value: 'immediate'
    },
    {
      label: i18n.t('label.competition_access_request'),
      value: 'request'
    },
    {
      label: i18n.t('label.competition_access_invitation'),
      value: 'invitation'
    }
  ];
  return (
    <View>
      <Dropdown
        label="Who can Join"
        data={data}
        onChangeText={props.handleChange('access')}
        lineWidth={1}
      />
    </View>
  );
}

export function AddImage(props) {
  const image = props.image;

  const pickImage = () => {
    ImagePicker.openPicker({
      waitAnimationEnd: false,
      includeExif: true,
      forceJpg: true,
      includeBase64: true
    })
      .then(image => {
        props.setFieldValue('imageFile', {
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
          data: image.data
        });
      })
      .catch(e => alert(e));
  };

  const clickImage = (cropping, mediaType = 'photo') => {
    ImagePicker.openCamera({
      includeExif: true,
      mediaType
    })
      .then(image => {
        props.setFieldValue('imageFile', {
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
          data: image.data
        });
      })
      .catch(e => alert(e));
  };

  const renderAsset = image => {
    return (
      <View style={styles.projectImageContainer}>
        <Image
          style={styles.teaser__projectImage}
          source={image}
          resizeMode={'cover'}
        />
      </View>
    );
  };
  return (
    <View>
      <Text style={styles.addImageTitle}>Add Image</Text>
      <View style={styles.showImage}>{image ? renderAsset(image) : null}</View>
      <View style={styles.addImageButtonContainer}>
        <TouchableOpacity
          style={styles.addImageButton1}
          onPress={pickImage.bind(this)}
        >
          <Image style={styles.addImageButtonIcon} source={imageGallery} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => clickImage(true)}
          style={styles.addImageButton2}
        >
          <Image style={styles.addImageButtonIcon} source={cameraSolid} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CompetitionDatePicker(props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  return (
    <View style={styles.formHalfTextField}>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <View>
          <Text style={styles.labelEndDate}>
            {i18n.t('label.competition_end_date')}
          </Text>
          <Text>{formatDate(formatDateToMySQL(props.endDate))}</Text>
        </View>
        <View style={styles.datePickerUnderline} />
      </TouchableOpacity>

      <DateTimePicker
        isVisible={showDatePicker}
        onConfirm={date => {
          (date = date || props.endDate),
            setShowDatePicker(false),
            props.setFieldValue('endDate', date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}
