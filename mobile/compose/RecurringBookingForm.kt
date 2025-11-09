package com.myclean.recurring

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

enum class FrequencyOption(val label: String) {
    ONE_TIME("One-time"),
    WEEKLY("Weekly"),
    BIWEEKLY("Bi-weekly"),
    MONTHLY("Monthly")
}

@Composable
fun RecurringBookingForm(
    onSubmit: (RecurringBookingRequest) -> Unit,
    modifier: Modifier = Modifier
) {
    var frequency by remember { mutableStateOf(FrequencyOption.ONE_TIME) }
    var expanded by remember { mutableStateOf(false) }

    Column(modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
            TextField(
                value = frequency.label,
                onValueChange = {},
                readOnly = true,
                label = { Text("Frequency") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                FrequencyOption.values().forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option.label) },
                        onClick = {
                          frequency = option
                          expanded = false
                        }
                    )
                }
            }
        }
        Button(onClick = { onSubmit(RecurringBookingRequest(frequency)) }) {
            Text("Save preference")
        }
    }
}

data class RecurringBookingRequest(val frequency: FrequencyOption)
