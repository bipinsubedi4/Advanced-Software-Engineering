package com.myclean.availability

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

data class AvailabilityBlockUi(val dayOfWeek: Int, val startTime: String, val endTime: String)

@Composable
fun CleanerAvailabilityEditor(
    initialBlocks: List<AvailabilityBlockUi>,
    onSave: (List<AvailabilityBlockUi>) -> Unit,
    modifier: Modifier = Modifier
) {
    var blocks by remember { mutableStateOf(initialBlocks) }

    Column(modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(blocks) { block ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFE8F0FE))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("${dayLabel(block.dayOfWeek)} ${block.startTime}-${block.endTime}")
                    Text("Remove", color = Color.Red, modifier = Modifier.clickable {
                        blocks = blocks.filterNot { it == block }
                    })
                }
            }
        }
        Text("Tap calendar to add new blocks")
        WeekGrid(onSlotSelected = { day, start ->
            blocks = blocks + AvailabilityBlockUi(day, start, incrementSlot(start))
        })
        Text(
            text = "Save",
            modifier = Modifier
                .align(Alignment.End)
                .clickable { onSave(blocks) }
                .padding(8.dp),
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
fun ClientBookingCalendar(
    availability: List<AvailabilityBlockUi>,
    bookedSlots: List<AvailabilityBlockUi>,
    onSlotPicked: (AvailabilityBlockUi) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier.padding(16.dp)) {
        availability.forEach { block ->
            val isBooked = bookedSlots.any { it.dayOfWeek == block.dayOfWeek && it.startTime == block.startTime }
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .background(if (isBooked) Color.LightGray else Color(0xFFD1FADF))
                    .clickable(enabled = !isBooked) { onSlotPicked(block) }
                    .padding(12.dp)
            ) {
                Text("${dayLabel(block.dayOfWeek)} ${block.startTime}-${block.endTime}")
            }
        }
    }
}

@Composable
private fun WeekGrid(onSlotSelected: (day: Int, start: String) -> Unit) {
    val sampleSlots = listOf("09:00", "11:00", "13:00", "15:00")
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        (0..6).forEach { day ->
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                sampleSlots.forEach { start ->
                    Box(
                        Modifier
                            .weight(1f)
                            .background(Color(0xFFF3F4F6))
                            .clickable { onSlotSelected(day, start) }
                            .padding(6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("${dayLabel(day)}\n$start")
                    }
                }
            }
        }
    }
}

private fun dayLabel(day: Int) = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")[day % 7]
private fun incrementSlot(start: String): String {
    val (hourStr, minute) = start.split(":")
    val hour = hourStr.toInt() + 2
    return "%02d:%s".format(hour, minute)
}
