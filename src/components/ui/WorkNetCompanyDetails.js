import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DetailRow from './DetailRow';

const WorkNetCompanyDetails = ({ jobDetails }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>회사 정보</Text>
            <DetailRow label="기업명" value={jobDetails.추가_회사명} />
            <DetailRow label="업종" value={jobDetails.업종} />
            <DetailRow label="기업규모" value={jobDetails.기업규모} />
            <DetailRow label="설립년도" value={jobDetails.설립년도} />
            <DetailRow label="연매출액" value={jobDetails.연매출액} />
            <DetailRow label="홈페이지" value={jobDetails.홈페이지} />
            <DetailRow label="근로자수" value={jobDetails.근로자수} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
});

export default WorkNetCompanyDetails;
